#!/usr/bin/env node
const ID = require("../src");
const readline = require('readline');
const fs = require('fs');
const path = require('path');

function help() {
  console.log(`
somalid v0.2.0 - Somali National ID validator / Xaqiijinta Kaarka Aqoonsiga Soomaaliya

Usage / Isticmaal:
  somalid validate --id <ID> --name "<NAME>" --sex <M/F> --dob <DATE> --issue <DATE> --expiry <DATE> [--lang <so|ar|en>]
  somalid mask --id <ID_NUMBER> [--head <N>] [--tail <N>]
  somalid batch --file <CSV_FILE> [--output <JSON_FILE>]
  somalid interactive
  somalid formats

Options:
  --lang <so|ar|en>     Language for error messages (Somali/Arabic/English)
  --head <N>           Number of digits to show at start when masking (default: 2)
  --tail <N>           Number of digits to show at end when masking (default: 3)

Examples / Tusaalooyin:
  somalid validate --id 934265782412 --name "Ahmed Hassan" --sex Male --dob 01-08-2005 --issue 21-01-2025 --expiry 21-01-2035
  somalid validate --id 934265782412 --name "فاطمة علي" --sex Female --dob 2005/08/01 --issue 2025.01.21 --expiry 2035-01-21 --lang ar
  somalid mask --id 934265782412 --head 3 --tail 2
  somalid batch --file ids.csv --output results.json
  somalid interactive

Supported Date Formats / Qaababka Taariikhda:
  dd-mm-yyyy (01-08-2005)    dd/mm/yyyy (01/08/2005)
  yyyy-mm-dd (2005-08-01)    dd.mm.yyyy (01.08.2005)

Languages / Luqadaha: English (en), Somali (so), Arabic (ar)
`.trim());
}

function showFormats() {
  console.log(`
📅 Supported Date Formats / Qaababka Taariikhda la Taageero:

Format          Example         Description
──────────────────────────────────────────────────────────
dd-mm-yyyy      15-03-1990      Day-Month-Year (default)
dd/mm/yyyy      15/03/1990      Day/Month/Year (slash)
yyyy-mm-dd      1990-03-15      Year-Month-Day (ISO)
dd.mm.yyyy      15.03.1990      Day.Month.Year (dot)

🌍 Language Support / Taageerada Luqadda:
- English (en)  - Default language
- Somali (so)   - Af-Soomaali
- Arabic (ar)   - العربية

Examples:
  somalid validate --id 934265782412 --name "Ahmed" --sex Male --dob 15-03-1990 --issue 01/01/2020 --expiry 2030-01-01
  somalid validate --id 934265782412 --name "أحمد" --sex Male --dob 15.03.1990 --issue 01-01-2020 --expiry 01-01-2030 --lang ar
`.trim());
}

async function interactiveMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function question(prompt) {
    return new Promise(resolve => rl.question(prompt, resolve));
  }

  console.log(`
🇸🇴 Interactive Somali ID Validator / Xaqiijinta Kaarka Aqoonsiga (Interactive)
═══════════════════════════════════════════════════════════════════════════════

Welcome! I'll help you validate a Somali National ID step by step.
Soo dhawoow! Waxaan kaa caawin doonaa xaqiijinta kaarka aqoonsiga tallaabo tallaabo.
`);

  try {
    // Language selection
    const lang = await question('Choose language / Dooro luqadda (en/so/ar): ');
    const language = lang.toLowerCase() || 'so';

    // Collect input
    const idNumber = await question('Enter ID Number / Geli lambarka aqoonsiga: ');
    const name = await question('Enter Full Name / Geli magaca buuxa: ');
    const sex = await question('Enter Sex (Male/Female/M/F) / Geli jinsiga (Lab/Dhedig): ');
    const dob = await question('Enter Date of Birth / Geli taariikhda dhalashada (dd-mm-yyyy): ');
    const issue = await question('Enter Issue Date / Geli taariikhda bixinta (dd-mm-yyyy): ');
    const expiry = await question('Enter Expiry Date / Geli taariikhda dhicitaanka (dd-mm-yyyy): ');

    console.log('\n🔍 Validating... / Waa la xaqiijinayaa...\n');

    const input = {
      idNumber: idNumber.trim(),
      name: name.trim(),
      sex: sex.trim(),
      dobDMY: dob.trim(),
      issueDMY: issue.trim(),
      expiryDMY: expiry.trim()
    };

    const result = ID.validateRecordMultilingual(input, ID.DEFAULT_RULE, language);
    
    // Success output
    console.log('✅ Validation Successful! / Xaqiijintu waa guul!\n');
    console.log('📋 Results / Natiijada:');
    console.log('─'.repeat(40));
    console.log(`Name / Magaca: ${result.name}`);
    console.log(`Sex / Jinsiga: ${result.sex}`);
    console.log(`ID (Masked) / Lambarka (Qarsoodi): ${ID.maskId(result.idNumber)}`);
    console.log(`Date of Birth / Dhalashada: ${result.dobISO.split('T')[0]}`);
    console.log(`Issue Date / Bixinta: ${result.issueISO.split('T')[0]}`);
    console.log(`Expiry Date / Dhicitaanka: ${result.expiryISO.split('T')[0]}`);

  } catch (error) {
    console.log('\n❌ Validation Failed! / Xaqiijintu way fashilantay!\n');
    console.log('🚨 Error Details / Faahfaahinta Khaladka:');
    console.log('─'.repeat(40));
    console.log(`English: ${error.message}`);
    if (error.somaliMessage) {
      console.log(`Somali: ${error.somaliMessage}`);
    }
    if (error.arabicMessage) {
      console.log(`Arabic: ${error.arabicMessage}`);
    }
    if (error.localizedMessage) {
      console.log(`Localized: ${error.localizedMessage}`);
    }
    console.log(`Code: ${error.code}`);
  }

  rl.close();
}

async function batchProcess(filePath, outputPath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('File is empty');
    }

    // Parse CSV (simple implementation)
    const headers = lines[0].split(',').map(h => h.trim());
    const records = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const record = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });
      return record;
    });

    console.log(`📁 Processing ${records.length} records from ${filePath}...`);
    
    const batchResult = ID.validateBatch(records);
    
    console.log('\n📊 Batch Processing Results:');
    console.log('─'.repeat(40));
    console.log(`Total Records: ${batchResult.summary.total}`);
    console.log(`Successful: ${batchResult.summary.successful}`);
    console.log(`Failed: ${batchResult.summary.failed}`);
    console.log(`Success Rate: ${batchResult.summary.successRate}`);

    if (outputPath) {
      fs.writeFileSync(outputPath, JSON.stringify(batchResult, null, 2));
      console.log(`\n💾 Results saved to: ${outputPath}`);
    } else {
      console.log('\n📋 Detailed Results:');
      console.log(JSON.stringify(batchResult, null, 2));
    }

  } catch (error) {
    console.error(`❌ Batch processing failed: ${error.message}`);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
const cmd = args[0];

function get(flag, fallback = null) {
  const i = args.indexOf(flag);
  if (i === -1 || i === args.length - 1) return fallback;
  return args[i + 1];
}

function getNumber(flag, fallback = null) {
  const value = get(flag, fallback);
  return value ? parseInt(value, 10) : fallback;
}

(async () => {
  try {
    switch (cmd) {
      case "validate": {
        const language = get("--lang", "so");
        const input = {
          idNumber: get("--id"),
          name: get("--name"),
          sex: get("--sex"),
          dobDMY: get("--dob"),
          issueDMY: get("--issue"),
          expiryDMY: get("--expiry"),
        };
        
        const res = ID.validateRecordMultilingual(input, ID.DEFAULT_RULE, language);
        // never print full ID in CLI output
        res.idMasked = ID.maskId(res.idNumber);
        delete res.idNumber;
        console.log(JSON.stringify({ ok: true, data: res }, null, 2));
        break;
      }
      
      case "mask": {
        const id = get("--id");
        const head = getNumber("--head", 2);
        const tail = getNumber("--tail", 3);
        console.log(ID.maskId(id, { head, tail }));
        break;
      }
      
      case "batch": {
        const filePath = get("--file");
        const outputPath = get("--output");
        if (!filePath) {
          console.error("❌ Error: --file parameter is required for batch processing");
          process.exit(1);
        }
        await batchProcess(filePath, outputPath);
        break;
      }
      
      case "interactive":
        await interactiveMode();
        break;
        
      case "formats":
        showFormats();
        break;
        
      default:
        help();
    }
  } catch (e) {
    const language = get("--lang", "so");
    const errorOutput = {
      ok: false,
      error: e.message,
      code: e.code || "ERROR",
    };

    // Add multilingual messages
    if (e.somaliMessage) {
      errorOutput.somaliError = e.somaliMessage;
    }
    if (e.arabicMessage) {
      errorOutput.arabicError = e.arabicMessage;
    }
    if (e.localizedMessage) {
      errorOutput.localizedError = e.localizedMessage;
    }

    console.error(JSON.stringify(errorOutput, null, 2));
    process.exit(1);
  }
})();