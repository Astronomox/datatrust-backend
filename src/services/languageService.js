class LanguageService {
  static translations = {
    en: {
      consent_granted: 'Consent granted successfully',
      access_logged: 'Data access logged',
      unauthorized_attempt: 'Unauthorized access attempt blocked'
    },
    yo: {
      consent_granted: 'Iyanjẹ ti fun ni aṣeyọri',
      access_logged: 'Ifọwọsi wiwọle ti wa ni iforukọsilẹ', 
      unauthorized_attempt: 'Gbiyanju wiwọle laigba aṣẹ dinku'
    },
    ha: {
      consent_granted: 'An ba da izini cikin nasara',
      access_logged: 'An yi rajistan shiga bayanai',
      unauthorized_attempt: 'An toshe yunkurin shiga mara izini'
    },
    ig: {
      consent_granted: 'Enyere nkwenye nke ọma',
      access_logged: 'Edebanyere ntinye data',
      unauthorized_attempt: 'Egbochiri mbọ ịnweta enweghị ikike'
    }
  };

  static getTranslation(language = 'en', key) {
    return this.translations[language]?.[key] || this.translations.en[key] || key;
  }

  static getConsentMessage(language, organization, dataTypes, purpose) {
    const messages = {
      en: `${organization} requests access to your ${dataTypes.join(', ')} for ${purpose}. Do you consent?`,
      yo: `${organization} n beere fun iwọle si ${dataTypes.join(', ')} rẹ fun ${purpose}. Ṣe o fọwọsi?`,
      ha: `${organization} yana neman shiga bayananka na ${dataTypes.join(', ')} don ${purpose}. Kuna ba da izini?`,
      ig: `${organization} na-arịọ ohere ịnweta ${dataTypes.join(', ')} gị maka ${purpose}. Ị kwenyere?`
    };

    return messages[language] || messages.en;
  }
}

module.exports = LanguageService;