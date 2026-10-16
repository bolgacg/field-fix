/* The two support tickets as data. The page draws the triage, the step cards and every count from this
   file, and tools/check_quotes.py checks each quotation against the page of Makin's PDF it cites.
   Line flags: g = general practice, not Makin's procedure. Pages are the manuals' own page numbers. */
window.GUIDE = {
  "sources": {
    "EX": {"short": "Excavator manual", "title": "Makin' Excavator 3D User Guide 2.36, 1st edition, June 2026", "url": "https://www.makin3d.com/wp-content/uploads/2025/03/Makin_Excavator_3D_Manual_EN.pdf"},
    "SV": {"short": "Survey manual", "title": "Makin' Survey User Guide 2.36, 1st edition, June 2026", "url": "https://www.makin3d.com/wp-content/uploads/2025/03/Makin_Survey_Manual_EN.pdf"},
    "WL": {"short": "Wheel loader manual", "title": "Makin' Wheel Loader User Guide 2.36, 1st edition, June 2026", "url": "https://www.makin3d.com/wp-content/uploads/2025/03/Makin_Wheel_Loader_Manual_EN.pdf"},
    "RN": {"short": "Release notes", "title": "Makin' 3D release notes, up to version 2.36.12 (10 June 2026)", "url": "https://www.makin3d.com/wp-content/uploads/2025/01/makin_3d_rel_notes.pdf"}
  },
  "tiers": [
    {"id": 1, "name": "On the tablet", "cost": "minutes, nothing moves"},
    {"id": 2, "name": "At the machine", "cost": "the operator moves the bucket or walks round"},
    {"id": 3, "name": "Remote session", "cost": "a support technician on the phone or in remote support"},
    {"id": 4, "name": "Technician work", "cost": "recalibration or repair, on site or guided"},
    {"id": 5, "name": "Makin", "cost": "escalation to Makin or an approved technician"}
  ],
  "tickets": [
    {
      "id": "t1",
      "chip": "Ticket one: bucket off grade",
      "title": "The bucket tip reads off grade",
      "summary": "The operator or the surveyor finds the bucket tip at a different height or position than the tablet shows. The tablet places the tip from the antenna's position plus the machine's geometry, so the checks first make sure the position is good, then look for settings that move the result on purpose, then measure.",
      "ask": [
        {"q": "Off by how much, in which direction, and was it measured on a known point?", "why": "A number and a direction turn a complaint into a measurement, and the calibration check needs a known point to compare against.", "src": [["EX", "172"]]},
        {"q": "Is it the same with every bucket and every tool point, or only one of them?", "why": "If one bucket is off and another is fine, the position and the machine are probably fine and that bucket's calibration is the suspect.", "g": true},
        {"q": "What changed since it was right: a new bucket, a knock, transport, a repair, an update, or the tablet moved from another machine?", "why": "The manual warns that errors may follow impact, abuse, modification or transport damage. Since version 2.33.0 one tablet and GNSS unit can move between machines with separate machine profiles, so the active profile is worth a question.", "src": [["EX", "9"], ["RN", "2.33.0"]]},
        {"q": "What do the satellites, hRMS and vRMS in the top bar say right now?", "why": "They describe how good the antenna's position is. If they are poor, the ticket is really ticket two.", "src": [["EX", "13"]]},
        {"q": "Which Version and IB-1 version does Status show?", "why": "Status shows both, and the release notes say which version fixed which fault.", "src": [["EX", "166"], ["RN", ""]]}
      ],
      "steps": [
        {
          "title": "Check the position before the bucket",
          "tier": 1,
          "src": [["EX", "13"], ["EX", "143"], ["EX", "172"]],
          "check": "Read the number of satellites, hRMS and vRMS in the top bar, and tap it for the GNSS status menu (p. 13). A calibration check needs a working correction signal and a DOP close to 1.0 or below (p. 172).",
          "means": [
            {"t": "Poor numbers or no correction: stop here and follow ticket two. A calibration cannot be judged on a poor position."},
            {"t": "Good numbers: the antenna's position is good, and that is all they say. The manual defines this accuracy at the GNSS antenna, not at the tool point (p. 143), so the search moves on to the machine and the bucket."}
          ],
          "quotes": [
            {"d": "EX", "p": "172", "t": "an operational GPS and correction signal with a DOP value as close to 1.0 or below as possible"},
            {"d": "EX", "p": "143", "t": "Accuracy is defined on the GNSS antenna, not the tool point"}
          ]
        },
        {
          "title": "Check which bucket and tool point are selected",
          "tier": 1,
          "src": [["EX", "162"], ["EX", "163"]],
          "check": "Open the Bucket menu and confirm that the selected bucket is the one on the machine (p. 162). Check the tool point: a corner of the bucket, or Auto-Corner, which picks the lowest point of a tilted bucket (p. 163).",
          "means": [
            {"t": "Wrong bucket selected: the tablet places the tip with another bucket's geometry. Select the right bucket and check again."},
            {"t": "A corner tool point on a tilted bucket reports that corner's height, not the centre of the cutting edge. Compare like with like before calling it an error.", "g": true}
          ],
          "quotes": [
            {"d": "EX", "p": "162", "t": "always ensure that the calibration is correct before starting work"}
          ]
        },
        {
          "title": "Look for an offset that moves the height on purpose",
          "tier": 1,
          "src": [["EX", "13"], ["EX", "72"], ["EX", "74"]],
          "check": "Look for the project offset icon on the work screen (p. 13). Project offset shifts the received GNSS height to match a known point, by up to 50 cm either way (p. 72). Change offset moves the whole design, for example 0.85 m down for a ditch under a road, and Show Original Model displays the design without it (p. 74).",
          "means": [
            {"t": "An offset nobody remembers setting explains a height that is wrong by the same amount everywhere. Confirm why it is there, or remove it."},
            {"t": "The manual says the machine must be calibrated correctly before a project offset is set (p. 72). An offset is not a repair for a calibration error."}
          ],
          "quotes": [
            {"d": "EX", "p": "72", "t": "You must ensure that the machine is calibrated correctly before adjusting the project offset."}
          ]
        },
        {
          "title": "Read the sensor warning and the software version",
          "tier": 1,
          "src": [["EX", "14"], ["EX", "166"], ["RN", "2.33.5"], ["RN", "2.33.7"]],
          "check": "Look for the sensor status indicator in the top bar and read its pop-up (p. 14). In Status, open Sensors for the details and note Version and IB-1 version (p. 166). Compare the version with the release notes.",
          "means": [
            {"t": "A sensor warning names the sensor to inspect in step 6."},
            {"t": "On a machine with tilt: version 2.33.5 added a notification for tilt that is enabled but not working, and 2.33.7 fixed MiC4 tilt not working. An older version is a reason to update before measuring."}
          ],
          "quotes": [
            {"d": "EX", "p": "14", "t": "This symbol is a sensor status indicator."},
            {"d": "RN", "p": "2.33.5", "t": "Added a notification when tilt is enabled but not functioning correctly."},
            {"d": "RN", "p": "2.33.7", "t": "Fixed MiC4 tilt not working"}
          ]
        },
        {
          "title": "Measure the bucket on a known point, open and closed",
          "tier": 2,
          "calc": true,
          "src": [["EX", "63"], ["EX", "67"], ["EX", "172"], ["EX", "173"], ["WL", "163"]],
          "check": "Put the centre of the open bucket's cutting edge on the known point and read the coordinates. Close the bucket and repeat on the same point (pp. 172 to 173). With tilt or a tiltrotator, repeat at full tilt and at several rotation angles on both sides (p. 173). If the site's fix points are loaded in the project, Fix point control runs this check and reports the horizontal and vertical difference for both bucket positions (pp. 63 to 67).",
          "means": [
            {"t": "Within a few centimetres of the known point: the calibration is correct (p. 173). The manual leaves the exact number to the project. The wheel loader manual words the same test as within the project's tolerances (p. 163 of that manual), so the calculator below asks for the tolerance."},
            {"t": "Outside the tolerance: recalibrate (p. 173). The pattern of the two readings says where to look first."},
            {"t": "Open and closed readings off by the same amount: the bucket geometry is probably fine and the error sits upstream, in the position, a height reference or the machine calibration.", "g": true},
            {"t": "Open and closed readings disagree with each other: between the two readings the antenna stays put and the bucket angle changes most, so the bucket calibration or the bucket sensor is the likely cause.", "g": true},
            {"t": "Height off by the same amount everywhere, with the calibration confirmed: the manual explains that reference systems, GNSS makes or design heights can differ, and project offset exists for that case (p. 72)."}
          ],
          "quotes": [
            {"d": "EX", "p": "173", "t": "If your reading is within a few centimetres of the target, the calibration is correct; otherwise, recalibrate."},
            {"d": "EX", "p": "67", "t": "It shows the difference horizontal and vertical for both the open and closed bucket."},
            {"d": "WL", "p": "163", "t": "If your reading is within the project's tolerances, your calibration is okay"}
          ]
        },
        {
          "title": "Walk round the machine: cables, sensors, mounts",
          "tier": 2,
          "src": [["EX", "9"], ["EX", "11"]],
          "check": "Look over the cables and the sensors on the bucket, stick, boom and machine body (p. 11) for damage, a loose mount or signs of a knock. The manual asks for damaged cables to be repaired before further use, and for the system to be checked after impact or transport (p. 9).",
          "means": [
            {"t": "Damage found: repair it first, then measure again as in step 5."},
            {"t": "A sensor that has shifted on its mount reports a different angle while working normally, so check the mounts as well as the cables.", "g": true}
          ],
          "quotes": [
            {"d": "EX", "p": "9", "t": "Ensure that no cables have external damage; damage must be repaired immediately before further use."},
            {"d": "EX", "p": "9", "t": "Errors in measurement results may occur if the equipment has been subjected to impact, abuse, modification, or transport damage."}
          ]
        },
        {
          "title": "If the calibration changed recently, restore the earlier one",
          "tier": 3,
          "src": [["EX", "174"], ["EX", "175"], ["EX", "177"]],
          "check": "The tablet saves a calibration snapshot every hour and whenever the calibration changes, and it keeps manual backups (pp. 174 to 176). Select the backup from before the change and confirm (p. 177), then measure again as in step 5.",
          "means": [
            {"t": "The error disappears: the change was the cause. Write down what was changed before anyone repeats it."},
            {"t": "Snapshots are cleared at the end of the day so that only the latest calibration remains (p. 174), so this works best on the same day. A manual backup stays."},
            {"t": "Nothing changed recently: skip this step."}
          ],
          "quotes": [
            {"d": "EX", "p": "174", "t": "Every hour, the snapshot function automatically creates a backup file of the current calibration"},
            {"d": "EX", "p": "174", "t": "only the latest calibration remains available"}
          ]
        },
        {
          "title": "Recalibrate the bucket",
          "tier": 4,
          "src": [["EX", "170"], ["EX", "171"], ["EX", "175"]],
          "check": "In the Bucket menu, select the bucket and tap the pen icon to open its calibration (pp. 170 to 171). The full procedure is the Makin' Learning course Calibration: Excavator Bucket (p. 171). Then measure again as in step 5.",
          "means": [
            {"t": "Within tolerance after recalibrating: save a manual backup of the good calibration (pp. 175 to 176)."},
            {"t": "Still outside: the bucket was not the cause. Escalate."}
          ],
          "quotes": [
            {"d": "EX", "p": "171", "t": "see the course Calibration: Excavator Bucket on Makin' Learning"}
          ]
        },
        {
          "title": "Escalate to Makin",
          "tier": 5,
          "src": [["EX", "9"], ["EX", "143"], ["EX", "166"], ["EX", "195"]],
          "check": "Escalate when the check stays outside the tolerance after a bucket recalibration, when a sensor warning stays after the cables and mounts are fine, or when the interface box LED flashes red, which the manual reads as a firmware issue for the reseller (p. 195). Main calibration is for Makin approved technical personnel only (p. 9).",
          "means": [
            {"t": "Send with it: the calculator's result for each reading, and a point logged on the known point. Its record carries HRMS, VRMS, PDOP, satellites, mountpoint, project offset and tool point (p. 143)."},
            {"t": "Also send Version, IB-1 version, system name and system number from Status (p. 166)."},
            {"t": "Note the time of each reading, so the GNSS conditions at that moment can be compared.", "g": true}
          ],
          "quotes": [
            {"d": "EX", "p": "9", "t": "All installation and main calibration of the system must be carried out by Makin approved technical personnel."}
          ]
        }
      ]
    },
    {
      "id": "t2",
      "chip": "Ticket two: GNSS float or lost",
      "title": "The GNSS position goes float or is lost",
      "summary": "The tablet shows a poor position or none, or the work screen says there is no RTK correction. The receiver reaches centimetres only with corrections from a base station, sent by UHF radio from a local base or over the internet by NTRIP (p. 152). The checks separate the sky, the correction link and the hardware.",
      "ask": [
        {"q": "Is there no position at all, or a position with worse accuracy? What do satellites, hRMS and vRMS say, and what message is on the work screen?", "why": "The top bar shows all three. The Survey manual describes a No RTK Correction message while the receiver tracks satellites, which points at the correction link rather than the sky.", "src": [["EX", "13"], ["SV", "158"]]},
        {"q": "NTRIP or UHF radio?", "why": "The two links fail in different ways, and the correction source menu shows which profile is active.", "src": [["EX", "152"]]},
        {"q": "One machine, or every machine on the same correction source?", "why": "Every machine losing its fix at once points at the source: the base, the network or the subscription. One machine alone points at that machine.", "g": true},
        {"q": "Where is the machine, and since when?", "why": "Tall buildings, forest and mountains block or reflect signals. A problem that began on a new site, after a SIM change or after an update narrows the search.", "src": [["EX", "187"]]},
        {"q": "Which Version does Status show?", "why": "Version 2.33.5 fixed a Tersus receiver losing its fix status without telling the user.", "src": [["EX", "166"], ["RN", "2.33.5"]]}
      ],
      "steps": [
        {
          "title": "Read the GNSS status",
          "tier": 1,
          "src": [["EX", "13"], ["EX", "166"], ["SV", "158"]],
          "check": "Read satellites, hRMS and vRMS in the top bar and tap it for the GNSS status menu (p. 13). Status, then GNSS, shows the connection status and the location (p. 166).",
          "means": [
            {"t": "Few satellites: the sky or the antenna. Go to step 4, then step 8."},
            {"t": "Satellites fine and No RTK Correction on the work screen: the correction link. Go to steps 3, 5 and 6. The Survey manual says the message clears once the receiver has an RTK fix (Survey manual, p. 158)."},
            {"t": "Float means corrections arrive but the receiver has not resolved a fixed solution, so accuracy is decimetres instead of centimetres. A float that never turns into a fix usually means a poor sky view, a long distance to the base, or corrections that arrive late.", "g": true}
          ],
          "quotes": [
            {"d": "EX", "p": "13", "t": "hRMS (Horizontal Root Mean Square) and vRMS (Vertical Root Mean Square) indicate the current GNSS accuracy."},
            {"d": "SV", "p": "158", "t": "The message will disappear once the device establishes an RTK fix position."}
          ]
        },
        {
          "title": "Check that GNSS was not switched off for 2D",
          "tier": 1,
          "src": [["EX", "146"], ["EX", "147"]],
          "check": "In the GNSS menu, look at GNSS device. Setting it to None is how the 2D functions are turned on, and it cuts off all GNSS to the system (p. 146).",
          "means": [
            {"t": "Set to None: someone switched to 2D. Turn the GNSS back on to return to 3D (p. 147)."}
          ],
          "quotes": [
            {"d": "EX", "p": "146", "t": "selecting the option None will cut off all GNSS signals to the system"}
          ]
        },
        {
          "title": "NTRIP: check the internet connection",
          "tier": 1,
          "only": "NTRIP",
          "src": [["EX", "13"], ["EX", "194"]],
          "check": "The internet symbol in the top bar is white when connected and gray when not (p. 13). The tablet's micro SIM gives broadband internet to both the tablet and the GNSS receiver (p. 194), and NTRIP corrections arrive over that connection.",
          "means": [
            {"t": "Gray: no internet, so no NTRIP corrections."},
            {"t": "Check mobile coverage on the site, the SIM and the data plan.", "g": true},
            {"t": "White: the connection is up. Go to the NTRIP profile in step 5."}
          ],
          "quotes": [
            {"d": "EX", "p": "13", "t": "The symbol appears white when a connection is established and gray if there is no connection."},
            {"d": "EX", "p": "194", "t": "Micro SIM card for broadband internet on both tablet and GNSS receiver"}
          ]
        },
        {
          "title": "Check the sky view",
          "tier": 2,
          "src": [["EX", "187"]],
          "check": "Look at what surrounds the machine: tall buildings, forest, mountains. They block satellites and cause reflections, and the app warns when there are not enough visible satellites or the CQ/DOP is too high (p. 187).",
          "means": [
            {"t": "If it can be done safely, move the machine to open sky and wait a few minutes.", "g": true},
            {"t": "The fix comes back in open sky: the site is the cause and the system is fine.", "g": true},
            {"t": "No fix even in open sky: the correction link or the hardware. Continue."}
          ],
          "quotes": [
            {"d": "EX", "p": "187", "t": "Makin' 3D will inform you if there are not enough visible satellites or if your CQ/DOP is too high."}
          ]
        },
        {
          "title": "NTRIP: check the active profile and its details",
          "tier": 3,
          "only": "NTRIP",
          "src": [["EX", "143"], ["EX", "152"], ["EX", "158"], ["EX", "159"], ["EX", "161"]],
          "check": "In GNSS, then Correction source, confirm which profile is active; activating one profile deactivates the current one (pp. 152 and 161). Compare server, port, username, password and mountpoint with the provider's account (p. 159). These details come from the NTRIP provider and are entered by the Makin supporter or the installer (p. 158).",
          "means": [
            {"t": "A changed password, an expired subscription or a wrong mountpoint stops corrections while the internet is fine. Ask whether the provider account was renewed or changed.", "g": true},
            {"t": "A point logged during the problem records which mountpoint was in use (p. 143), which shows what the machine was really connected to."}
          ],
          "quotes": [
            {"d": "EX", "p": "159", "t": "This mountpoint defines which corrections and from which GNSS satellites Makin can calculate an accurate position."},
            {"d": "EX", "p": "158", "t": "the information must be entered by the Makin' supporter or installer"}
          ]
        },
        {
          "title": "UHF radio: check the profile against the base",
          "tier": 3,
          "only": "UHF",
          "src": [["EX", "155"], ["EX", "157"], ["EX", "188"]],
          "check": "Compare the UHF profile with the base station: frequency, bandwidth of 25000 or 12500 Hz, protocol, FEC, scrambling and base ID (p. 155). Channel numbers convert to frequencies in 25 kHz steps from a centre channel (p. 188).",
          "means": [
            {"t": "Base ID on Auto can take corrections from two bases on the same frequency, which the manual calls not optimal. Lock it to the site's base with Custom (pp. 155 to 157)."},
            {"t": "The profile matches but nothing arrives: check that the base is powered, has not been moved, and is within radio range.", "g": true}
          ],
          "quotes": [
            {"d": "EX", "p": "155", "t": "if you use the 'Auto' option, you might experience corrections from two bases, which is not optimal."}
          ]
        },
        {
          "title": "Check the software version against known fixes",
          "tier": 3,
          "src": [["EX", "166"], ["EX", "184"], ["RN", "2.33.5"], ["RN", "2.20.6"]],
          "check": "Read Version and IB-1 version in Status (p. 166) and compare them with the release notes. Updates install from the in-app notification (p. 184).",
          "means": [
            {"t": "Older than 2.33.5: that version fixed a Tersus receiver losing its fix status without telling the user, and Ethernet settings on the tablet being reset, which lost communication with the interface box."},
            {"t": "Version 2.20.6 fixed GNSS startup issues on the AsteRx-U3 receiver."}
          ],
          "quotes": [
            {"d": "RN", "p": "2.33.5", "t": "Fixed an issue where Tersus lost fix status without notifying the user."},
            {"d": "RN", "p": "2.33.5", "t": "Fixed a problem where Ethernet settings on the tablet were reset, causing loss of communication with the interface box."},
            {"d": "RN", "p": "2.20.6", "t": "GNSS: Fixed startup issues on the AsteRx-U3"}
          ]
        },
        {
          "title": "Inspect the antenna, cables and interface box",
          "tier": 4,
          "src": [["EX", "9"], ["EX", "195"]],
          "check": "Check the antenna cable and connectors for damage (p. 9). Read the LED next to the interface box power connector: green is all ok, flashing red a firmware issue for the reseller, white a system check, blue a software update in progress (p. 195).",
          "means": [
            {"t": "Damage found: repair it before further use (p. 9)."},
            {"t": "If a known good antenna or cable is on site, swap one part at a time to find the faulty one.", "g": true}
          ],
          "quotes": [
            {"d": "EX", "p": "9", "t": "Broken cables on the system may cause short circuits, system errors, and defective components."}
          ]
        },
        {
          "title": "Escalate to Makin",
          "tier": 5,
          "src": [["EX", "13"], ["EX", "143"], ["EX", "166"]],
          "check": "Escalate when the machine has open sky, other machines get a fix from the same correction source, the software is current, the profile matches and the hardware looks fine, and there is still no fix. Makin can join a remote support session, and the tablet shows an indicator while it does (p. 13).",
          "means": [
            {"t": "Send with it: the GNSS status, Version, IB-1 version, system name and number (p. 166), and a point logged during the problem with its HRMS, VRMS, PDOP, satellites and mountpoint (p. 143)."},
            {"t": "Note the time and place of the drop-outs, so they can be matched against the correction provider's own status.", "g": true}
          ],
          "quotes": [
            {"d": "EX", "p": "13", "t": "An indication that you have remote support from Makin."}
          ]
        }
      ]
    }
  ],
  "parts": [
    {"id": "tip", "name": "Bucket tip", "chain": "both", "does": "The point the operator works to. The tablet places it from the antenna's position plus the angles of boom, stick and bucket, so an error here comes from one of the two chains.", "checks": "Ticket one, step 5 measures it on a known point.", "src": [["EX", "172"]]},
    {"id": "antenna", "name": "GNSS antenna", "chain": "position", "does": "Receives the satellite signals. hRMS and vRMS describe the accuracy at the antenna, not at the tool point (p. 143).", "checks": "Ticket two, steps 1, 4 and 8. Ticket one, step 1.", "src": [["EX", "11"], ["EX", "143"]]},
    {"id": "receiver", "name": "GNSS receiver", "chain": "position", "does": "Turns satellites and corrections into a position. Makin's notes name Tersus and AsteRx-U3 receivers among those it supports.", "checks": "Ticket two, steps 1 and 7.", "src": [["EX", "11"], ["RN", "2.33.5"]]},
    {"id": "corr", "name": "Corrections: base or NTRIP", "chain": "position", "does": "A local base sends corrections by UHF radio, or an NTRIP network sends them over the internet through the tablet's SIM (pp. 152 and 194). Without them the position is not good enough for grading.", "checks": "Ticket two, steps 3, 5 and 6.", "src": [["EX", "152"], ["EX", "194"]]},
    {"id": "arm", "name": "Boom, stick and bucket sensors", "chain": "geometry", "does": "Measure the angles that place the bucket tip relative to the machine (p. 11).", "checks": "Ticket one, steps 4, 5, 6 and 8.", "src": [["EX", "11"]]},
    {"id": "body", "name": "Machine sloping sensors", "chain": "geometry", "does": "Measure how the machine body leans (p. 11).", "checks": "Ticket one, steps 4 and 6.", "src": [["EX", "11"]]},
    {"id": "box", "name": "Interface box and tablet", "chain": "both", "does": "The interface box powers the sensors and carries their data; its LED shows its state (pp. 11 and 195). The tablet holds the bucket list, the offsets and the calibration (pp. 72, 162 and 174).", "checks": "Ticket one, steps 2, 3 and 7. Ticket two, step 8.", "src": [["EX", "11"], ["EX", "195"]]}
  ]
};
