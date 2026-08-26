# Rok — recording script

Read each line naturally, at an unhurried pace, as if speaking to
someone frightened. Leave half a second of silence at the start and end
of every clip. A quiet room and a phone microphone are enough.

Save as: `public/audio/<locale>/<file>.mp3`
Then add the key to that locale's array in `src/i18n/recordings.js`.

Anything not recorded falls back to speech synthesis automatically, so
this can be done a few lines at a time.

## en — 30 clips

| # | File | Say this |
| --- | --- | --- |
| 1 | `palm-spoken.mp3` | My money is gone. Press the big red button to start. It takes less than a minute. |
| 2 | `palm-listen.mp3` | Read this to me |
| 3 | `safetyTriage-question.mp3` | Are they still on the phone? |
| 4 | `safetyTriage-hangup_spoken.mp3` | Hang up now. Do not tell them anything. Do not send any more money. |
| 5 | `safetyTriage-step_hangup.mp3` | End the call |
| 6 | `safetyTriage-step_silence.mp3` | Tell them nothing |
| 7 | `safetyTriage-step_nothing.mp3` | Send nothing more |
| 8 | `messageWall-title.mp3` | Which one is wrong? |
| 9 | `messageWall-why.mp3` | Look at the amount. You do not need to read the message. |
| 10 | `messageWall-receipt_title.mp3` | This is what we read |
| 11 | `scope-question.mp3` | Only this one? |
| 12 | `scope-why.mp3` | Each payment may need its own hold. |
| 13 | `reachedVia-question.mp3` | How did they reach you? |
| 14 | `reachedVia-why.mp3` | This files your case under the right heading. You never pick a category. |
| 15 | `jurisdiction-question.mp3` | Where are you? |
| 16 | `jurisdiction-why.mp3` | Your complaint goes to the police in your own State. This is the only reason we ask. |
| 17 | `readBack-question.mp3` | Is this true? |
| 18 | `readBack-why.mp3` | We write the complaint. You only say yes or no. |
| 19 | `readBack-confirm_yes.mp3` | Yes |
| 20 | `readBack-confirm_no.mp3` | No |
| 21 | `caseComplete-heading.mp3` | Your case is open |
| 22 | `caseComplete-four_lines.mp3` | Your case in four lines |
| 23 | `caseComplete-route_call.mp3` | Speak it |
| 24 | `caseComplete-route_write.mp3` | Send it in writing |
| 25 | `caseComplete-route_helper.mp3` | Ask someone |
| 26 | `calmMode-heading.mp3` | When you are ready |
| 27 | `calmMode-support.mp3` | None of this is urgent. None of it was needed to open your case. Come back tomorrow if you like. |
| 28 | `guardianHandoff-title.mp3` | Let someone help |
| 29 | `app-listen.mp3` | Listen |
| 30 | `neverAsk-otp_banner.mp3` | Rok never asks for your OTP or PIN. Anyone who does is a fraud. |

## hi — 30 clips

| # | File | Say this |
| --- | --- | --- |
| 1 | `palm-spoken.mp3` | मेरे पैसे चले गए। शुरू करने के लिए बड़ा लाल बटन दबाएँ। एक मिनट से भी कम लगेगा। |
| 2 | `palm-listen.mp3` | मुझे पढ़कर सुनाएँ |
| 3 | `safetyTriage-question.mp3` | क्या वे अब भी फ़ोन पर हैं? |
| 4 | `safetyTriage-hangup_spoken.mp3` | अभी फ़ोन काट दें। उन्हें कुछ न बताएँ। और पैसे न भेजें। |
| 5 | `safetyTriage-step_hangup.mp3` | कॉल काटें |
| 6 | `safetyTriage-step_silence.mp3` | कुछ न बताएँ |
| 7 | `safetyTriage-step_nothing.mp3` | और कुछ न भेजें |
| 8 | `messageWall-title.mp3` | इनमें से गलत कौन सा है? |
| 9 | `messageWall-why.mp3` | रकम देखिए। पूरा संदेश पढ़ने की ज़रूरत नहीं। |
| 10 | `messageWall-receipt_title.mp3` | हमने यह पढ़ा |
| 11 | `scope-question.mp3` | सिर्फ़ यही एक? |
| 12 | `scope-why.mp3` | हर भुगतान को अलग से रोकना पड़ सकता है। |
| 13 | `reachedVia-question.mp3` | उन्होंने आपसे कैसे संपर्क किया? |
| 14 | `reachedVia-why.mp3` | इससे शिकायत सही श्रेणी में दर्ज होगी। आपको कुछ चुनना नहीं है। |
| 15 | `jurisdiction-question.mp3` | आप कहाँ हैं? |
| 16 | `jurisdiction-why.mp3` | आपकी शिकायत आपके अपने राज्य की पुलिस को जाती है। हम सिर्फ़ इसीलिए पूछ रहे हैं। |
| 17 | `readBack-question.mp3` | क्या यह सही है? |
| 18 | `readBack-why.mp3` | शिकायत हम लिखते हैं। आपको सिर्फ़ हाँ या ना कहना है। |
| 19 | `readBack-confirm_yes.mp3` | हाँ |
| 20 | `readBack-confirm_no.mp3` | नहीं |
| 21 | `caseComplete-heading.mp3` | आपकी शिकायत दर्ज हो गई |
| 22 | `caseComplete-four_lines.mp3` | आपकी शिकायत, चार पंक्तियों में |
| 23 | `caseComplete-route_call.mp3` | बोलकर बताएँ |
| 24 | `caseComplete-route_write.mp3` | लिखकर भेजें |
| 25 | `caseComplete-route_helper.mp3` | किसी से कहें |
| 26 | `calmMode-heading.mp3` | जब आप तैयार हों |
| 27 | `calmMode-support.mp3` | इसमें कुछ भी जल्दी का नहीं है। शिकायत दर्ज करने के लिए इनमें से कुछ भी ज़रूरी नहीं था। चाहें तो कल आइए। |
| 28 | `guardianHandoff-title.mp3` | किसी को मदद करने दें |
| 29 | `app-listen.mp3` | सुनें |
| 30 | `neverAsk-otp_banner.mp3` | Rok कभी आपका OTP या PIN नहीं पूछता। जो पूछे वह ठग है। |

## ta — 30 clips

| # | File | Say this |
| --- | --- | --- |
| 1 | `palm-spoken.mp3` | என் பணம் போய்விட்டது. தொடங்க பெரிய சிவப்பு பொத்தானை அழுத்துங்கள். ஒரு நிமிடத்திற்குள் முடிந்துவிடும். |
| 2 | `palm-listen.mp3` | எனக்குப் படித்துக் காட்டுங்கள் |
| 3 | `safetyTriage-question.mp3` | அவர்கள் இன்னும் பேசுகிறார்களா? |
| 4 | `safetyTriage-hangup_spoken.mp3` | இப்போதே அழைப்பைத் துண்டியுங்கள். அவர்களிடம் எதுவும் சொல்ல வேண்டாம். இனி பணம் அனுப்ப வேண்டாம். |
| 5 | `safetyTriage-step_hangup.mp3` | அழைப்பை முடியுங்கள் |
| 6 | `safetyTriage-step_silence.mp3` | எதுவும் சொல்ல வேண்டாம் |
| 7 | `safetyTriage-step_nothing.mp3` | இனி எதுவும் அனுப்ப வேண்டாம் |
| 8 | `messageWall-title.mp3` | இதில் எது தவறு? |
| 9 | `messageWall-why.mp3` | தொகையைப் பாருங்கள். செய்தியை முழுவதும் படிக்க வேண்டாம். |
| 10 | `messageWall-receipt_title.mp3` | நாங்கள் படித்தது |
| 11 | `scope-question.mp3` | இது ஒன்று மட்டுமா? |
| 12 | `scope-why.mp3` | ஒவ்வொரு பரிவர்த்தனையையும் தனியாக நிறுத்த வேண்டியிருக்கும். |
| 13 | `reachedVia-question.mp3` | அவர்கள் எப்படித் தொடர்பு கொண்டார்கள்? |
| 14 | `reachedVia-why.mp3` | இது புகாரைச் சரியான தலைப்பில் பதிவு செய்யும். நீங்கள் எதையும் தேர்ந்தெடுக்க வேண்டாம். |
| 15 | `jurisdiction-question.mp3` | நீங்கள் எங்கே இருக்கிறீர்கள்? |
| 16 | `jurisdiction-why.mp3` | உங்கள் புகார் உங்கள் மாநிலக் காவல்துறைக்குச் செல்லும். அதற்காக மட்டுமே கேட்கிறோம். |
| 17 | `readBack-question.mp3` | இது சரியா? |
| 18 | `readBack-why.mp3` | புகாரை நாங்கள் எழுதுகிறோம். நீங்கள் ஆம் அல்லது இல்லை சொன்னால் போதும். |
| 19 | `readBack-confirm_yes.mp3` | ஆம் |
| 20 | `readBack-confirm_no.mp3` | இல்லை |
| 21 | `caseComplete-heading.mp3` | உங்கள் புகார் பதிவாகிவிட்டது |
| 22 | `caseComplete-four_lines.mp3` | உங்கள் புகார், நான்கு வரிகளில் |
| 23 | `caseComplete-route_call.mp3` | பேசிச் சொல்லுங்கள் |
| 24 | `caseComplete-route_write.mp3` | எழுதி அனுப்புங்கள் |
| 25 | `caseComplete-route_helper.mp3` | யாரிடமாவது சொல்லுங்கள் |
| 26 | `calmMode-heading.mp3` | நீங்கள் தயாராகும்போது |
| 27 | `calmMode-support.mp3` | இதில் எதுவும் அவசரம் இல்லை. புகாரைத் தொடங்க இவை தேவைப்படவில்லை. வேண்டுமானால் நாளை வாருங்கள். |
| 28 | `guardianHandoff-title.mp3` | யாராவது உதவட்டும் |
| 29 | `app-listen.mp3` | கேளுங்கள் |
| 30 | `neverAsk-otp_banner.mp3` | Rok உங்கள் OTP அல்லது PIN ஐ ஒருபோதும் கேட்காது. கேட்பவர் மோசடிக்காரர். |

## te — 30 clips

| # | File | Say this |
| --- | --- | --- |
| 1 | `palm-spoken.mp3` | నా డబ్బు పోయింది. మొదలుపెట్టడానికి పెద్ద ఎరుపు బటన్ నొక్కండి. ఒక నిమిషం లోపే అవుతుంది. |
| 2 | `palm-listen.mp3` | నాకు చదివి వినిపించండి |
| 3 | `safetyTriage-question.mp3` | వాళ్లు ఇంకా ఫోన్‌లో ఉన్నారా? |
| 4 | `safetyTriage-hangup_spoken.mp3` | ఇప్పుడే ఫోన్ కట్ చేయండి. వాళ్లకి ఏమీ చెప్పకండి. ఇంకా డబ్బు పంపకండి. |
| 5 | `safetyTriage-step_hangup.mp3` | కాల్ కట్ చేయండి |
| 6 | `safetyTriage-step_silence.mp3` | ఏమీ చెప్పకండి |
| 7 | `safetyTriage-step_nothing.mp3` | ఇంకేమీ పంపకండి |
| 8 | `messageWall-title.mp3` | వీటిలో తప్పు ఏది? |
| 9 | `messageWall-why.mp3` | మొత్తాన్ని చూడండి. సందేశం అంతా చదవనవసరం లేదు. |
| 10 | `messageWall-receipt_title.mp3` | మేము చదివింది ఇది |
| 11 | `scope-question.mp3` | ఇది ఒక్కటేనా? |
| 12 | `scope-why.mp3` | ప్రతి చెల్లింపును విడిగా ఆపవలసి రావచ్చు. |
| 13 | `reachedVia-question.mp3` | వాళ్లు మిమ్మల్ని ఎలా సంప్రదించారు? |
| 14 | `reachedVia-why.mp3` | ఇది మీ ఫిర్యాదును సరైన విభాగంలో నమోదు చేస్తుంది. మీరు ఏదీ ఎంచుకోనవసరం లేదు. |
| 15 | `jurisdiction-question.mp3` | మీరు ఎక్కడ ఉన్నారు? |
| 16 | `jurisdiction-why.mp3` | మీ ఫిర్యాదు మీ రాష్ట్ర పోలీసులకు వెళ్తుంది. అందుకే మాత్రమే అడుగుతున్నాం. |
| 17 | `readBack-question.mp3` | ఇది నిజమేనా? |
| 18 | `readBack-why.mp3` | ఫిర్యాదు మేము రాస్తాం. మీరు అవును లేదా కాదు చెబితే చాలు. |
| 19 | `readBack-confirm_yes.mp3` | అవును |
| 20 | `readBack-confirm_no.mp3` | కాదు |
| 21 | `caseComplete-heading.mp3` | మీ ఫిర్యాదు నమోదైంది |
| 22 | `caseComplete-four_lines.mp3` | మీ ఫిర్యాదు, నాలుగు వాక్యాల్లో |
| 23 | `caseComplete-route_call.mp3` | మాట్లాడి చెప్పండి |
| 24 | `caseComplete-route_write.mp3` | రాసి పంపండి |
| 25 | `caseComplete-route_helper.mp3` | ఎవరినైనా అడగండి |
| 26 | `calmMode-heading.mp3` | మీరు సిద్ధమైనప్పుడు |
| 27 | `calmMode-support.mp3` | ఇందులో ఏదీ అత్యవసరం కాదు. ఫిర్యాదు మొదలుపెట్టడానికి ఇవి అవసరం లేదు. కావాలంటే రేపు రండి. |
| 28 | `guardianHandoff-title.mp3` | ఎవరైనా సాయం చేయనివ్వండి |
| 29 | `app-listen.mp3` | వినండి |
| 30 | `neverAsk-otp_banner.mp3` | Rok మీ OTP లేదా PIN ఎప్పుడూ అడగదు. అడిగేవాడు మోసగాడు. |

---

**Total: 120 clips across 4 languages.**

Record with a native speaker of each language — the same person who
reviews that locale's copy. Reviewing and recording are one sitting.
