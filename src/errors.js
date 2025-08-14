class SomaliIdError extends Error {
    constructor(message, code, somaliMessage) {
      super(message);
      this.name = "SomaliIdError";
      this.code = code;
      this.somaliMessage = somaliMessage;
    }
  }

  const CODES = {
    INVALID_ID_NUMBER: "INVALID_ID_NUMBER",
    INVALID_NAME: "INVALID_NAME",
    INVALID_SEX: "INVALID_SEX",
    INVALID_DATE: "INVALID_DATE",
    INCONSISTENT_DATES: "INCONSISTENT_DATES",
    INVALID_INPUT: "INVALID_INPUT",
    MISSING_FIELD: "MISSING_FIELD"
  };

  // Somali error messages
  const SOMALI_MESSAGES = {
    INVALID_ID_NUMBER: "Lambarka aqoonsiga waa inuu noqdaa tiro sax ah",
    INVALID_NAME: "Magaca wuxuu leeyahay xarfo aan la aqbali karin ama wuu dheer yahay",
    INVALID_SEX: "Jinsiga waa inuu noqdaa Lab ama Dhedig",
    INVALID_DATE: "Taariikhda waa inay noqoto qaabka saxda ah",
    INCONSISTENT_DATES: "Taariikhyada ma wada waafaqsana",
    INVALID_INPUT: "Gelinta waa khalad, waa inay noqoto shay",
    MISSING_FIELD: "Goobta loo baahan yahay way maqan tahay"
  };

  // Arabic error messages (العربية)
  const ARABIC_MESSAGES = {
    INVALID_ID_NUMBER: "رقم الهوية يجب أن يكون رقماً صحيحاً",
    INVALID_NAME: "الاسم يحتوي على أحرف غير صالحة أو طويل جداً",
    INVALID_SEX: "الجنس يجب أن يكون ذكر أو أنثى",
    INVALID_DATE: "التاريخ يجب أن يكون بالتنسيق الصحيح",
    INCONSISTENT_DATES: "التواريخ غير متسقة",
    INVALID_INPUT: "المدخل غير صالح، يجب أن يكون كائناً",
    MISSING_FIELD: "الحقل المطلوب مفقود"
  };

  // Language support
  const SUPPORTED_LANGUAGES = {
    en: 'English',
    so: 'Somali',
    ar: 'Arabic'
  };

  function getLocalizedMessage(code, language = 'en') {
    switch (language.toLowerCase()) {
      case 'so':
      case 'somali':
        return SOMALI_MESSAGES[code];
      case 'ar':
      case 'arabic':
        return ARABIC_MESSAGES[code];
      default:
        return null; // Return null for English, will use default message
    }
  }

  module.exports = { 
    SomaliIdError, 
    CODES, 
    SOMALI_MESSAGES, 
    ARABIC_MESSAGES,
    SUPPORTED_LANGUAGES,
    getLocalizedMessage
  };
  