#!/usr/bin/env node
const ID = require("../src");

function help() {
  console.log(
    `
somalid - Somali National ID validator / Xaqiijinta Kaarka Aqoonsiga Soomaaliya

Usage / Isticmaal:
  somalid validate --id <ID_NUMBER> --name "<NAME>" --sex <Male|Female> --dob dd-mm-yyyy --issue dd-mm-yyyy --expiry dd-mm-yyyy
  somalid mask --id <ID_NUMBER>

Examples / Tusaalooyin:
  somalid validate --id 934265782412 --name "Example Person" --sex Female --dob 01-08-2005 --issue 21-01-2025 --expiry 21-01-2035
  somalid mask --id 934265782412

Note: Error messages are provided in both English and Somali (Af-Soomaali)
Fiiro gaar ah: Farriimaha khaladka waxaa lagu bixiyaa Ingiriisi iyo Af-Soomaali labadaba
`.trim()
  );
}

const args = process.argv.slice(2);
const cmd = args[0];

function get(flag, fallback = null) {
  const i = args.indexOf(flag);
  if (i === -1 || i === args.length - 1) return fallback;
  return args[i + 1];
}

(async () => {
  try {
    switch (cmd) {
      case "validate": {
        const input = {
          idNumber: get("--id"),
          name: get("--name"),
          sex: get("--sex"),
          dobDMY: get("--dob"),
          issueDMY: get("--issue"),
          expiryDMY: get("--expiry"),
        };
        const res = ID.validateRecord(input, ID.DEFAULT_RULE);
        // never print full ID in CLI output
        res.idMasked = ID.maskId(res.idNumber);
        delete res.idNumber;
        console.log(JSON.stringify({ ok: true, data: res }, null, 2));
        break;
      }
      case "mask": {
        const id = get("--id");
        console.log(ID.maskId(id));
        break;
      }
      default:
        help();
    }
  } catch (e) {
    const errorOutput = {
      ok: false,
      error: e.message,
      code: e.code || "ERROR",
    };

    // Add Somali message if available
    if (e.somaliMessage) {
      errorOutput.somaliError = e.somaliMessage;
    }

    console.error(JSON.stringify(errorOutput, null, 2));
    process.exit(1);
  }
})();
