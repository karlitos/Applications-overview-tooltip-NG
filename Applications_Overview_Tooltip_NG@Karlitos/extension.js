const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const St = imports.gi.St;
const Tweener = imports.ui.tweener;
const Gio = imports.gi.Gio
const ExtensionUtils = imports.misc.extensionUtils;
const Pango = imports.gi.Pango;

// get current extension
const extension = imports.misc.extensionUtils.getCurrentExtension();

// used to restore monkey patched function on disable
let _old_addItem = null;
// used to disconnect events on disable
let _tooltips = null;
// id of timer waiting for start
let _labelTimeoutId = 0;
// id of last (cancellable) timer
let _resetHoverTimeoutId = 0;
// actor for displaying the tooltip (or null)
let _label = null;
// self explainatory
let _labelShowing = false;

// stores settings from the schema
let _settings;
function init() {
  const GioSSS = Gio.SettingsSchemaSource;

  let schemaSource = GioSSS.new_from_directory(extension.path + "/schemas",
                                               GioSSS.get_default(), false);

  let schemaObj = schemaSource.lookup(extension.metadata["settings-schema"], true);
  if(!schemaObj) {
    throw new Error("Schema " + extension.metadata["settings-schema"] + " could not be found for extension " +
                    extension.uuid + ". Please check your installation.");
  }

  _settings = new Gio.Settings({ settings_schema: schemaObj });
}

function _get_tooltip_label_show_time() { return (_settings.get_int("label-show-time")/100); }
function _get_tooltip_label_hide_time() { return (_settings.get_int("label-hide-time")/100); }
function _get_tooltip_hover_timeout() { return (_settings.get_int("hoover-timeout")); }
function _get_always_show_tooltip() { return (_settings.get_boolean("allways-show-tooltips")); }
function _get_show_app_description() { return (_settings.get_boolean("show-app-description")); }
function _get_tooltip_text_font_size() { return (_settings.get_int("font-size")); }
function _get_tooltip_text_max_width() { return (_settings.get_int("max-width")); }
  
  
function enable() {
  _tooltips = new Array();
  // Enabling tooltips after _appIcons has been populated
  let appIcons = Main.overview.viewSelector.appDisplay._views[1].view._items;
  //global.log("appIcons after enable",appIcons, Object.keys(appIcons).length);
  for (let i in appIcons) {
    _connect(appIcons[i].actor);
  }
  // monkeypatching for the load time and for the search overview tooltips
  _old_addItem = imports.ui.iconGrid.IconGrid.prototype.addItem;
  imports.ui.iconGrid.IconGrid.prototype.addItem = function(item, index){
    _connect(item.actor);
    // original part of the function I'm overwriting
    _old_addItem.apply(this, arguments);
  };
}

function disable() {
  //restore the function
  imports.ui.iconGrid.IconGrid.prototype.addItem = _old_addItem;
  for (let i = 0; i < _tooltips.length; i++) {
    //disconnect hover signals
    _tooltips[i].actor.disconnect(_tooltips[i].connection);
  }
  _tooltips=null;
}

function _onHover(actor){
  if (actor.get_hover()) {
    if (_labelTimeoutId == 0) {
      let timeout = _labelShowing ? 0 : _get_tooltip_hover_timeout();
      _labelTimeoutId = Mainloop.timeout_add(timeout,
                                             function() {
                                               _labelShowing = true;
                                               _showTooltip(actor);
                                               return false;
                                             }
                                            );
      if (_resetHoverTimeoutId > 0) {
        Mainloop.source_remove(_resetHoverTimeoutId);
        _resetHoverTimeoutId = 0;
      }
    }
  } else {
    if (_labelTimeoutId > 0){
      Mainloop.source_remove(_labelTimeoutId);
    }
    _labelTimeoutId = 0;
    _hideTooltip();
    if (_labelShowing) {
      _resetHoverTimeoutId = Mainloop.timeout_add(_get_tooltip_hover_timeout(),
                                                  function() {
                                                    _labelShowing = false;
                                                    return false;
                                                  }
                                                 );
    }
  }
}

function _showTooltip(actor) {
  let icontext = '';
  let should_display = false;
  if (actor._delegate.app){
    //applications overview
    icontext = actor._delegate.app.get_name();
    if (_get_show_app_description()) {
      let appDescription = actor._delegate.app.get_description();
      // allow only valid description-text (not null)
      if (appDescription){
        icontext = icontext.concat(" :\n", appDescription);
      }
    }
    if (!_get_always_show_tooltip()){
      // will be displayed if elipsized/text cut-off (is_ellipsized)
      should_display = actor._delegate.icon.label.get_clutter_text().get_layout().is_ellipsized();
    } else {
      // show always
      should_display = true;
    }
  }/*else if (actor._delegate._content._delegate){
        //app and settings searchs results
        icontext = actor._delegate.metaInfo['name'];
        should_display = actor._delegate._content._delegate.icon.label.get_clutter_text().get_layout().is_ellipsized();
    }else if (actor._delegate._content.label_actor){
        //locations and other (generic) search results (wanda wouldn't work)
        icontext = actor._delegate.metaInfo['name'];
        should_display = actor._delegate._content.label_actor.get_clutter_text().get_layout().is_ellipsized();
    }*/
  else if (actor._delegate.hasOwnProperty('_folder')){
    // folder in the application overview
    icontext = 'Group: '.concat(actor._delegate['name']);
    if (!_get_always_show_tooltip()){
      // will be displayed if elipsized/text cut-off (is_ellipsized)
      should_display = actor._delegate.icon.label.get_clutter_text().get_layout().is_ellipsized();
    } else {
      // show always
      should_display = true;
    }
  }else{
    //app and settings searchs results
    icontext = actor._delegate.metaInfo['name'];
    if (!_get_always_show_tooltip()){
      // will be displayed if elipsized/text cut-off (is_ellipsized)
      should_display = actor._delegate.icon.label.get_clutter_text().get_layout().is_ellipsized();
    } else {
      // show always
      should_display = true;
    }
  }

  if (!should_display){
    return;
  }

  if (!_label) {
    _label = new St.Label({text: icontext});
    Main.uiGroup.add_actor(_label);
  }else{
    _label.text = icontext;
  }

  // (inline) styling
  _label.style = 'font-size: ' + _get_tooltip_text_font_size() + 'px; max-width:' + _get_tooltip_text_max_width() + 'px; font-weight: bold; color: ' + '#ffffff' +'; text-align: center; background-color: ' + 'rgba(10,10,10,0.6)' + '; border-radius: 5px; padding: 5px;';
  _label.clutter_text.line_wrap = true;
  _label.clutter_text.line_wrap_mode = Pango.WrapMode.WORD;
  _label.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;

  [stageX, stageY] = actor.get_transformed_position();
  [iconWidth, iconHeight] = actor.get_transformed_size();

  let y = stageY + iconHeight + 5;
  let x = stageX - Math.round((_label.get_width() - iconWidth)/2);
  _label.opacity = 0;
  _label.set_position(x, y);
  Tweener.addTween(_label,{
    opacity: 255,
    time: _get_tooltip_label_show_time(),
    transition: 'easeOutQuad',
  });
}

function _hideTooltip() {
  if (_label){
    Tweener.addTween(_label, {
      opacity: 0,
      time: _get_tooltip_label_hide_time(),
      transition: 'easeOutQuad',
      onComplete: function() {
        Main.uiGroup.remove_actor(_label);
        _label = null;
      }
    });
  }
}

function _connect(actr){
  let con = actr.connect('notify::hover', _onHover);
  _tooltips.push({actor: actr, connection: con});
}
