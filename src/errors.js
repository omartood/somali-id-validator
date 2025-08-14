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
    INCONSISTENT_DATES: "INCONSISTENT_DATES"
  };

  // Somali error messages
  const SOMALI_MESSAGES = {
    INVALID_ID_NUMBER: "Lambarka aqoonsiga waa inuu noqdaa tiro sax ah",
    INVALID_NAME: "Magaca wuxuu leeyahay xarfo aan la aqbali karin ama wuu dheer yahay",
    INVALID_SEX: "Jinsiga waa inuu noqdaa Lab ama Dhedig",
    INVALID_DATE: "Taariikhda waa inay noqoto qaabka dd-mm-yyyy",
    INCONSISTENT_DATES: "Taariikhyada ma wada waafaqsana"
  };

  module.exports = { SomaliIdError, CODES, SOMALI_MESSAGES };
  