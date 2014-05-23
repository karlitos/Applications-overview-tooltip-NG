/* Applications overview tooltip
 *
 * Preferences dialog for gnome-shell-extensions-prefs tool
 */
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const ExtensionUtils = imports.misc.extensionUtils;

// get current extension
const extension = imports.misc.extensionUtils.getCurrentExtension();

// stores settings from the schema
let settings;

// settings initialization
function init() {

  const GioSSS = Gio.SettingsSchemaSource;

    let schemaSource = GioSSS.new_from_directory(extension.path + "/schemas",
            GioSSS.get_default(), false);

    let schemaObj = schemaSource.lookup(extension.metadata["settings-schema"], true);
    if(!schemaObj) {
        throw new Error("Schema " + extension.metadata["settings-schema"] + " could not be found for extension " +
                        extension.uuid + ". Please check your installation.");
    }

    settings = new Gio.Settings({ settings_schema: schemaObj });
}

// building the preferences Gui
function buildPrefsWidget() {
  let frame = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    border_width: 10
  });

  // add the GtkSpinButton for hoover-timeout
  frame.add(buildSpinn("hoover-timeout", [0, 1500, 1, 10], "How long the mouse-cursor have to stay over the icon before the tooltip is displayed (in ms)"));
  frame.add(buildSpinn("label-show-time", [0, 150, 1, 10], "Determines how fast the tooltip should be displayed."));
  frame.add(buildSpinn("label-hide-time", [0, 150, 1, 10], "Determines how fast the tooltip should be dismissed."));
  frame.add(buildSwitcher("allways-show-tooltips", "Always show tooltips (even if the icon-label is not elipsized)."));
  frame.add(buildSwitcher("show-app-description", "Display also app description in the tooltip."));
  frame.add(buildSpinn("font-size", [5, 20, 1, 10], "Determines the font-size (in px)of the tooltip text"));
  frame.add(buildSpinn("max-width", [50, 2000, 1, 10], "How wide (in px) the tooltip text can be before the is gets wrapped."));

  frame.show_all();

  return frame;
}

// funtion creating the GtkSwitch widgets
function buildSwitcher(key, labeltext, tooltip) {
	let hbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 });

	let label = new Gtk.Label({label: labeltext, xalign: 0 });

	let switcher = new Gtk.Switch({active: settings.get_boolean(key)});

	switcher.connect('notify::active', function(widget) {
		settings.set_boolean(key, widget.active);
	});

	hbox.pack_start(label, true, true, 0);
	hbox.add(switcher);

	return hbox;
}

// funtion creating the GtkSpinButton widgets
function buildSpinn(key, values, labeltext) {
	let [min, max, step, page] = values;
	let hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 });

	let label = new Gtk.Label({label: labeltext, xalign: 0 });

	let spin = new Gtk.SpinButton();
	spin.set_range(min, max);
	spin.set_increments(step, page);
	spin.set_value(settings.get_int(key));

	spin.connect('value-changed', function(widget) {
		settings.set_int(key, widget.get_value());
	});

	hbox.pack_start(label, true, true, 0);
	hbox.add(spin);

	return hbox;

}
