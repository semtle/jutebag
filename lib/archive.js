/*
 * jutebag
 *
 * A command line interface for Pocket a.k.a. getpocket.com a.k.a. Read It Later
 *
 * Copyright(c) 2013 André König <andre.koenig@gmail.com>
 * MIT Licensed
 *
 */

var api        = require("./utils/api"),
    colors     = require('colors'),
    shell      = require("./utils/shell"),
    underscore = require("underscore");

module.exports = function (configuration, datastore) {
    "use strict";

    var archiveCmd = {};

    Object.defineProperties(archiveCmd, {
        "id": {
            enumerable: true,
            writable: false,
            value: 4
        },
        "pattern": {
            enumerable: true,
            writable: false,
            value: "archive"
        },
        "description": {
            enumerable: true,
            writable: false,
            value: "Lists all you archived items."
        },
        "options": {
            enumerable: true,
            writable: false,
            value: [
                {
                    "pattern": '-t, --tags "<comma-separated tags>"',
                    "description": "The tags you want to filter your items in the archive for."
                }
            ]
        },
        "exec": {
            enumerable: true,
            writable: false,
            value: function (options) {
                var accessToken,
                    tags,
                    elderly;

                accessToken = configuration.get("accessToken");

                if (options.tags) {
                    tags = options.tags.split(",");
                }

                elderly = datastore.get();

                api.sync(accessToken, elderly, function (err, data) {
                    var items,
                        output = "\n";

                    if (err) {
                        console.log(("\n ✖ Outsch. Getting your archived items was not successful: \n\n   " + err + "\n").red);
                    } else {
                        datastore.set(data);
                        datastore.save();

                        items = datastore
                                    .where("unread")
                                    .is(false)
                                    .and("tags")
                                    .matches(tags)
                                    .end();

                        underscore.toArray(items).forEach(function (item) {
                            var TAB,
                                title,
                                tags;

                            TAB = "   ";
                            title = item.resolved_title ? " ★ " + item.resolved_title : ' ⚠ No title';
                            tags = underscore.pluck(underscore.toArray(item.tags), "tag").join(", ");

                            // Constructing the output
                            output += "\n";
                            output += title.green.bold + "\n\n";
                            output += TAB + item.resolved_url + "\n\n";
                            output += TAB + ("ID: " + item.item_id + ((tags) ? " - Tags: " + tags : "") + "\n\n").grey;
                            output += "\n";
                        });

                        console.log(output);
                    }

                    shell.exit(+(!!(err)));
                });
            }
        }
    });

    return archiveCmd;
};