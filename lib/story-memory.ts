export const MEMORY_STAGES = ["meet", "chunk", "repeat", "complete", "recall"] as const;

export type MemoryStageId = (typeof MEMORY_STAGES)[number];

export type StoryLine = {
  id: number;
  english: string;
  turkish: string;
  chunks?: string[];
  hiddenWord?: string;
};

export type Story = {
  id: string;
  lessonNumber: number;
  seriesTitle: string;
  title: string;
  turkishTitle: string;
  level: string;
  duration: string;
  focusWords: string[];
  lines: StoryLine[];
};

export type StoryProgress = {
  completedStageIds: MemoryStageId[];
};

export type MemoryStage = {
  id: MemoryStageId;
  title: string;
  eyebrow: string;
  duration: string;
  description: string;
  prompt: string;
};

export type LessonCard = {
  id: string;
  lessonNumber: number;
  title: string;
  subtitle: string;
  focus: string;
  duration: string;
  status: "active" | "upcoming";
  imageKey: "morning" | "office" | "memory" | "grocery" | "directions" | "doctor" | "restaurant" | "hotel" | "interview" | "airport" | "phoneCall" | "presentation";
};

export const LESSON_CARDS: readonly LessonCard[] = [
  {
    id: "lesson-01",
    lessonNumber: 1,
    title: "Dilek's Busy Wednesday",
    subtitle: "Dilek'in Yoğun Çarşambası",
    focus: "must · can · could",
    duration: "30 dk",
    status: "active",
    imageKey: "morning",
  },
  {
    id: "lesson-02",
    lessonNumber: 2,
    title: "Ordering a Coffee",
    subtitle: "Kahve Siparişi",
    focus: "would like · could I have",
    duration: "30 dk",
    status: "active",
    imageKey: "office",
  },
  {
    id: "lesson-03",
    lessonNumber: 3,
    title: "Planning the Weekend",
    subtitle: "Hafta Sonu Planı",
    focus: "going to · shall we",
    duration: "30 dk",
    status: "active",
    imageKey: "memory",
  },
  {
    id: "lesson-04",
    lessonNumber: 4,
    title: "Grocery Shopping",
    subtitle: "Market Alışverişi",
    focus: "how much · a kilo of",
    duration: "30 dk",
    status: "active",
    imageKey: "grocery",
  },
  {
    id: "lesson-05",
    lessonNumber: 5,
    title: "Asking for Directions",
    subtitle: "Yol Tarifi Sorma",
    focus: "where is · turn left",
    duration: "30 dk",
    status: "active",
    imageKey: "directions",
  },
  {
    id: "lesson-06",
    lessonNumber: 6,
    title: "A Doctor's Appointment",
    subtitle: "Doktor Randevusu",
    focus: "appointment · feel",
    duration: "30 dk",
    status: "active",
    imageKey: "doctor",
  },
  {
    id: "lesson-07",
    lessonNumber: 7,
    title: "Ordering at a Restaurant",
    subtitle: "Restoranda Sipariş",
    focus: "I’d like · for my main course",
    duration: "30 dk",
    status: "active",
    imageKey: "restaurant",
  },
  {
    id: "lesson-08",
    lessonNumber: 8,
    title: "Booking a Hotel",
    subtitle: "Otel Rezervasyonu",
    focus: "I’d like to book · check in",
    duration: "30 dk",
    status: "active",
    imageKey: "hotel",
  },
  {
    id: "lesson-09",
    lessonNumber: 9,
    title: "A Job Interview",
    subtitle: "İş Görüşmesi",
    focus: "experience · strengths",
    duration: "30 dk",
    status: "active",
    imageKey: "interview",
  },
  {
    id: "lesson-10",
    lessonNumber: 10,
    title: "Airport Check-in",
    subtitle: "Havaalanında Check-in",
    focus: "passport · boarding pass",
    duration: "30 dk",
    status: "active",
    imageKey: "airport",
  },
  {
    id: "lesson-11",
    lessonNumber: 11,
    title: "A Phone Call",
    subtitle: "Telefon Görüşmesi",
    focus: "could you repeat · hold on",
    duration: "30 dk",
    status: "active",
    imageKey: "phoneCall",
  },
  {
    id: "lesson-12",
    lessonNumber: 12,
    title: "Giving a Presentation",
    subtitle: "Sunum Yapma",
    focus: "today I’ll talk about · questions",
    duration: "30 dk",
    status: "active",
    imageKey: "presentation",
  },
];

const LESSON_01_LINES: StoryLine[] = [
  { id: 1, english: "It is Wednesday morning.", turkish: "Çarşamba sabahı.", chunks: ["It is", "Wednesday", "morning"], hiddenWord: "Wednesday" },
  { id: 2, english: "Dilek is on her way to the office.", turkish: "Dilek ofise doğru yolda.", chunks: ["Dilek is", "on her way", "to the office"], hiddenWord: "office" },
  { id: 3, english: "She has an important meeting today, so she is a little worried.", turkish: "Bugün önemli bir toplantısı var, bu yüzden biraz endişeli.", chunks: ["She has", "an important meeting", "today", "so she is", "a little worried"], hiddenWord: "meeting" },
  { id: 4, english: "I must finish my report before the meeting.", turkish: "Toplantıdan önce raporumu bitirmek zorundayım.", chunks: ["I must finish", "my report", "before the meeting"], hiddenWord: "finish" },
  { id: 5, english: "Dilek opens her computer, but there is a problem.", turkish: "Dilek bilgisayarını açıyor ama bir sorun var.", chunks: ["Dilek opens", "her computer", "but there is", "a problem"], hiddenWord: "problem" },
  { id: 6, english: "She cannot log in to the system.", turkish: "Sisteme giriş yapamıyor.", chunks: ["She cannot", "log in", "to the system"], hiddenWord: "cannot" },
  { id: 7, english: "Could you help me, please?", turkish: "Bana yardım edebilir misiniz, lütfen?", chunks: ["Could you", "help me", "please"], hiddenWord: "help" },
  { id: 8, english: "Of course. We can solve the problem.", turkish: "Elbette. Sorunu çözebiliriz.", chunks: ["Of course", "we can solve", "the problem"], hiddenWord: "solve" },
  { id: 9, english: "Now I can finish my report.", turkish: "Şimdi raporumu bitirebilirim.", chunks: ["Now I can", "finish", "my report"], hiddenWord: "can" },
  { id: 10, english: "I need more time, but I should not worry too much.", turkish: "Daha fazla zamana ihtiyacım var ama çok fazla endişelenmemeliyim.", chunks: ["I need", "more time", "but I should not", "worry too much"], hiddenWord: "should" },
  { id: 11, english: "The meeting goes well.", turkish: "Toplantı iyi geçiyor.", chunks: ["The meeting", "goes well"], hiddenWord: "well" },
  { id: 12, english: "I will go home now, but first I need a coffee.", turkish: "Şimdi eve gideceğim ama önce bir kahveye ihtiyacım var.", chunks: ["I will", "go home now", "but first", "I need a coffee"], hiddenWord: "coffee" },
];

export const STORIES: readonly Story[] = [
  {
    id: "dileks-busy-wednesday",
    lessonNumber: 1,
    seriesTitle: "Günlük Hayat İngilizcesi",
    title: "Dilek's Busy Wednesday",
    turkishTitle: "Dilek'in Yoğun Çarşambası",
    level: "A1 · Başlangıç",
    duration: "10–12 dakika",
    focusWords: ["must", "can", "could", "should", "will", "because", "but", "so"],
    lines: LESSON_01_LINES,
  },
  {
    id: "ordering-a-coffee",
    lessonNumber: 2,
    seriesTitle: "Günlük Hayat İngilizcesi",
    title: "Ordering a Coffee",
    turkishTitle: "Kahve Siparişi",
    level: "A1 · Başlangıç",
    duration: "8–10 dakika",
    focusWords: ["would like", "could I have", "please", "sugar", "milk"],
    lines: [
      { id: 1, english: "Dilek is at the coffee shop.", turkish: "Dilek kahve dükkanında.", chunks: ["Dilek is", "at the coffee shop"], hiddenWord: "coffee" },
      { id: 2, english: "Good morning! What would you like?", turkish: "Günaydın! Ne istersiniz?", chunks: ["Good morning", "What would you like"], hiddenWord: "like" },
      { id: 3, english: "I would like a medium latte, please.", turkish: "Bir orta boy latte rica ediyorum, lütfen.", chunks: ["I would like", "a medium latte", "please"], hiddenWord: "latte" },
      { id: 4, english: "Sure. Would you like some sugar?", turkish: "Tabii. Biraz şeker ister misiniz?", chunks: ["Sure", "Would you like", "some sugar"], hiddenWord: "sugar" },
      { id: 5, english: "No, thank you. But could I have some cold milk?", turkish: "Hayır, teşekkürler. Ama biraz soğuk süt alabilir miyim?", chunks: ["No thank you", "But could I have", "some cold milk"], hiddenWord: "milk" },
      { id: 6, english: "Of course. Anything else?", turkish: "Elbette. Başka bir şey?", chunks: ["Of course", "Anything else"], hiddenWord: "else" },
      { id: 7, english: "That is all. How much is it?", turkish: "Hepsi bu. Ne kadar?", chunks: ["That is all", "How much is it"], hiddenWord: "much" },
      { id: 8, english: "It is five pounds. You can pay by card.", turkish: "Beş pound. Kartla ödeyebilirsiniz.", chunks: ["It is five pounds", "You can pay", "by card"], hiddenWord: "card" },
    ],
  },
  {
    id: "planning-the-weekend",
    lessonNumber: 3,
    seriesTitle: "Günlük Hayat İngilizcesi",
    title: "Planning the Weekend",
    turkishTitle: "Hafta Sonu Planı",
    level: "A1 · Başlangıç",
    duration: "10–12 dakika",
    focusWords: ["going to", "shall we", "because", "visit", "museum"],
    lines: [
      { id: 1, english: "Dilek is talking to her friend, Selin.", turkish: "Dilek arkadaşı Selin ile konuşuyor.", chunks: ["Dilek is talking", "to her friend", "Selin"], hiddenWord: "talking" },
      { id: 2, english: "What are you going to do this weekend?", turkish: "Bu hafta sonu ne yapacaksın?", chunks: ["What are you", "going to do", "this weekend"], hiddenWord: "weekend" },
      { id: 3, english: "I am going to visit a museum on Saturday.", turkish: "Cumartesi günü bir müzeyi ziyaret edeceğim.", chunks: ["I am going to", "visit a museum", "on Saturday"], hiddenWord: "museum" },
      { id: 4, english: "That sounds great! Shall we go together?", turkish: "Kulağa harika geliyor! Birlikte gidelim mi?", chunks: ["That sounds great", "Shall we go", "together"], hiddenWord: "together" },
      { id: 5, english: "Yes, I would love to. I want to see the new exhibition.", turkish: "Evet, çok isterim. Yeni sergiyi görmek istiyorum.", chunks: ["Yes I would love to", "I want to see", "the new exhibition"], hiddenWord: "exhibition" },
      { id: 6, english: "We should meet at ten o'clock because it is very busy later.", turkish: "Saat onda buluşmalıyız çünkü daha sonra çok kalabalık oluyor.", chunks: ["We should meet", "at ten o'clock", "because it is", "very busy later"], hiddenWord: "busy" },
      { id: 7, english: "Okay. I will call you on Friday night.", turkish: "Tamam. Seni Cuma gecesi arayacağım.", chunks: ["Okay", "I will call you", "on Friday night"], hiddenWord: "Friday" },
    ],
  },
  {
    id: "grocery-shopping",
    lessonNumber: 4,
    seriesTitle: "Günlük Hayat İngilizcesi",
    title: "Grocery Shopping",
    turkishTitle: "Market Alışverişi",
    level: "A1 · Başlangıç",
    duration: "10–12 dakika",
    focusWords: ["how much", "a kilo of", "anything else", "bag", "fresh"],
    lines: [
      { id: 1, english: "Dilek is at the grocery store after work.", turkish: "Dilek işten sonra markette.", chunks: ["Dilek is", "at the grocery store", "after work"], hiddenWord: "store" },
      { id: 2, english: "Excuse me. How much are these apples?", turkish: "Affedersiniz. Bu elmalar ne kadar?", chunks: ["Excuse me", "How much are", "these apples"], hiddenWord: "apples" },
      { id: 3, english: "They are three pounds a kilo.", turkish: "Kilosu üç pound.", chunks: ["They are", "three pounds", "a kilo"], hiddenWord: "kilo" },
      { id: 4, english: "Great. I would like a kilo of apples, please.", turkish: "Harika. Bir kilo elma istiyorum, lütfen.", chunks: ["Great", "I would like", "a kilo of apples", "please"], hiddenWord: "would" },
      { id: 5, english: "Are the tomatoes fresh today?", turkish: "Domatesler bugün taze mi?", chunks: ["Are the tomatoes", "fresh", "today"], hiddenWord: "fresh" },
      { id: 6, english: "Yes, they are. Can I get you anything else?", turkish: "Evet, tazeler. Başka bir şey vereyim mi?", chunks: ["Yes they are", "Can I get you", "anything else"], hiddenWord: "else" },
      { id: 7, english: "No, thank you. Could I have a paper bag?", turkish: "Hayır, teşekkürler. Kâğıt poşet alabilir miyim?", chunks: ["No thank you", "Could I have", "a paper bag"], hiddenWord: "bag" },
      { id: 8, english: "Of course. Have a nice evening!", turkish: "Elbette. İyi akşamlar!", chunks: ["Of course", "Have a nice evening"], hiddenWord: "evening" },
    ],
  },
  {
    id: "asking-for-directions",
    lessonNumber: 5,
    seriesTitle: "Günlük Hayat İngilizcesi",
    title: "Asking for Directions",
    turkishTitle: "Yol Tarifi Sorma",
    level: "A1 · Başlangıç",
    duration: "10–12 dakika",
    focusWords: ["where is", "turn left", "straight", "next to", "across from"],
    lines: [
      { id: 1, english: "Dilek is visiting a new part of the city.", turkish: "Dilek şehrin yeni bir bölümünü geziyor.", chunks: ["Dilek is visiting", "a new part", "of the city"], hiddenWord: "visiting" },
      { id: 2, english: "Excuse me. Where is the city museum?", turkish: "Affedersiniz. Şehir müzesi nerede?", chunks: ["Excuse me", "Where is", "the city museum"], hiddenWord: "museum" },
      { id: 3, english: "Go straight for two blocks.", turkish: "İki blok boyunca dümdüz gidin.", chunks: ["Go straight", "for two blocks"], hiddenWord: "straight" },
      { id: 4, english: "Then turn left at the traffic lights.", turkish: "Sonra trafik ışıklarında sola dönün.", chunks: ["Then turn left", "at the traffic lights"], hiddenWord: "left" },
      { id: 5, english: "Is it far from here?", turkish: "Buradan uzak mı?", chunks: ["Is it far", "from here"], hiddenWord: "far" },
      { id: 6, english: "No, it is about ten minutes on foot.", turkish: "Hayır, yürüyerek yaklaşık on dakika.", chunks: ["No it is", "about ten minutes", "on foot"], hiddenWord: "foot" },
      { id: 7, english: "Is the museum next to the library?", turkish: "Müze kütüphanenin yanında mı?", chunks: ["Is the museum", "next to", "the library"], hiddenWord: "next" },
      { id: 8, english: "Yes, it is across from the park.", turkish: "Evet, parkın karşısında.", chunks: ["Yes it is", "across from", "the park"], hiddenWord: "across" },
    ],
  },
  {
    id: "doctors-appointment",
    lessonNumber: 6,
    seriesTitle: "Günlük Hayat İngilizcesi",
    title: "A Doctor's Appointment",
    turkishTitle: "Doktor Randevusu",
    level: "A1 · Başlangıç",
    duration: "10–12 dakika",
    focusWords: ["appointment", "feel", "since", "medicine", "rest"],
    lines: [
      { id: 1, english: "Dilek is at the doctor's office.", turkish: "Dilek doktorun muayenehanesinde.", chunks: ["Dilek is", "at the doctor's office"], hiddenWord: "doctor" },
      { id: 2, english: "Good morning. I have an appointment with Dr. Lee.", turkish: "Günaydın. Dr. Lee ile randevum var.", chunks: ["Good morning", "I have an appointment", "with Dr. Lee"], hiddenWord: "appointment" },
      { id: 3, english: "What is your name, please?", turkish: "Adınız nedir, lütfen?", chunks: ["What is", "your name", "please"], hiddenWord: "name" },
      { id: 4, english: "My name is Dilek Kaya. I do not feel well today.", turkish: "Benim adım Dilek Kaya. Bugün kendimi iyi hissetmiyorum.", chunks: ["My name is", "Dilek Kaya", "I do not feel well", "today"], hiddenWord: "feel" },
      { id: 5, english: "How long have you felt this way?", turkish: "Ne zamandır böyle hissediyorsunuz?", chunks: ["How long", "have you felt", "this way"], hiddenWord: "long" },
      { id: 6, english: "Since yesterday. I have a sore throat.", turkish: "Dünden beri. Boğazım ağrıyor.", chunks: ["Since yesterday", "I have", "a sore throat"], hiddenWord: "throat" },
      { id: 7, english: "Please drink water and take this medicine after food.", turkish: "Lütfen su için ve bu ilacı yemekten sonra alın.", chunks: ["Please drink water", "and take", "this medicine", "after food"], hiddenWord: "medicine" },
      { id: 8, english: "Thank you, doctor. I will rest at home.", turkish: "Teşekkürler doktor. Evde dinleneceğim.", chunks: ["Thank you doctor", "I will rest", "at home"], hiddenWord: "rest" },
    ],
  },
  {
    id: "ordering-at-a-restaurant",
    lessonNumber: 7,
    seriesTitle: "Günlük Hayat İngilizcesi",
    title: "Ordering at a Restaurant",
    turkishTitle: "Restoranda Sipariş",
    level: "A2 · Günlük durum",
    duration: "12–15 dakika",
    focusWords: ["I’d like", "main course", "side dish", "bill", "allergic"],
    lines: [
      { id: 1, english: "Dilek is having dinner at a small restaurant.", turkish: "Dilek küçük bir restoranda akşam yemeği yiyor.", chunks: ["Dilek is having dinner", "at a small restaurant"], hiddenWord: "dinner" },
      { id: 2, english: "Good evening. Are you ready to order?", turkish: "İyi akşamlar. Sipariş vermeye hazır mısınız?", chunks: ["Good evening", "Are you ready", "to order"], hiddenWord: "ready" },
      { id: 3, english: "Yes, I’d like the vegetable soup, please.", turkish: "Evet, sebze çorbası istiyorum, lütfen.", chunks: ["Yes", "I’d like", "the vegetable soup", "please"], hiddenWord: "soup" },
      { id: 4, english: "What would you like for your main course?", turkish: "Ana yemek olarak ne istersiniz?", chunks: ["What would you like", "for your main course"], hiddenWord: "course" },
      { id: 5, english: "I’ll have the grilled chicken with a side salad.", turkish: "Yan salata ile ızgara tavuk alacağım.", chunks: ["I’ll have", "the grilled chicken", "with a side salad"], hiddenWord: "grilled" },
      { id: 6, english: "Does the chicken contain any nuts? I am allergic to them.", turkish: "Tavukta kuruyemiş var mı? Onlara alerjim var.", chunks: ["Does the chicken contain", "any nuts", "I am allergic"], hiddenWord: "allergic" },
      { id: 7, english: "No, it does not. I will check with the chef.", turkish: "Hayır, yok. Şefle kontrol edeceğim.", chunks: ["No it does not", "I will check", "with the chef"], hiddenWord: "chef" },
      { id: 8, english: "Everything was delicious. Could I have the bill, please?", turkish: "Her şey çok lezzetliydi. Hesabı alabilir miyim, lütfen?", chunks: ["Everything was delicious", "Could I have", "the bill please"], hiddenWord: "bill" },
    ],
  },
  {
    id: "booking-a-hotel",
    lessonNumber: 8,
    seriesTitle: "Günlük Hayat İngilizcesi",
    title: "Booking a Hotel",
    turkishTitle: "Otel Rezervasyonu",
    level: "A2 · Günlük durum",
    duration: "12–15 dakika",
    focusWords: ["I’d like to book", "available", "single room", "check in", "breakfast"],
    lines: [
      { id: 1, english: "Dilek is planning a short trip for next month.", turkish: "Dilek gelecek ay için kısa bir gezi planlıyor.", chunks: ["Dilek is planning", "a short trip", "for next month"], hiddenWord: "trip" },
      { id: 2, english: "Hello, I’d like to book a room for two nights.", turkish: "Merhaba, iki geceliğine bir oda ayırtmak istiyorum.", chunks: ["Hello", "I’d like to book", "a room", "for two nights"], hiddenWord: "book" },
      { id: 3, english: "Of course. When would you like to check in?", turkish: "Elbette. Ne zaman giriş yapmak istersiniz?", chunks: ["Of course", "When would you like", "to check in"], hiddenWord: "check" },
      { id: 4, english: "I would like to arrive on Friday, October tenth.", turkish: "10 Ekim Cuma günü gelmek istiyorum.", chunks: ["I would like", "to arrive", "on Friday", "October tenth"], hiddenWord: "arrive" },
      { id: 5, english: "We have a single room available with breakfast.", turkish: "Kahvaltı dahil tek kişilik bir odamız var.", chunks: ["We have", "a single room", "available", "with breakfast"], hiddenWord: "available" },
      { id: 6, english: "That sounds perfect. Is Wi-Fi included?", turkish: "Kulağa mükemmel geliyor. Wi-Fi dahil mi?", chunks: ["That sounds perfect", "Is Wi-Fi", "included"], hiddenWord: "included" },
      { id: 7, english: "Yes, and the room has a view of the city.", turkish: "Evet, odanın şehir manzarası da var.", chunks: ["Yes", "the room has", "a view of the city"], hiddenWord: "view" },
      { id: 8, english: "Great. Could you send me the booking details by email?", turkish: "Harika. Rezervasyon bilgilerini e-postayla gönderebilir misiniz?", chunks: ["Great", "Could you send me", "the booking details", "by email"], hiddenWord: "details" },
    ],
  },
  {
    id: "a-job-interview",
    lessonNumber: 9,
    seriesTitle: "Günlük Hayat İngilizcesi",
    title: "A Job Interview",
    turkishTitle: "İş Görüşmesi",
    level: "A2 · Günlük durum",
    duration: "12–15 dakika",
    focusWords: ["experience", "strengths", "team", "learn", "available"],
    lines: [
      { id: 1, english: "Dilek has an interview for a customer support job.", turkish: "Dilek müşteri destek işi için görüşmeye gidiyor.", chunks: ["Dilek has an interview", "for a customer support job"], hiddenWord: "support" },
      { id: 2, english: "Thank you for coming in today, Dilek.", turkish: "Bugün geldiğiniz için teşekkürler Dilek.", chunks: ["Thank you", "for coming in", "today Dilek"], hiddenWord: "coming" },
      { id: 3, english: "Thank you for inviting me. I am happy to be here.", turkish: "Beni davet ettiğiniz için teşekkürler. Burada olmaktan mutluyum.", chunks: ["Thank you", "for inviting me", "I am happy", "to be here"], hiddenWord: "inviting" },
      { id: 4, english: "Can you tell me about your previous experience?", turkish: "Önceki deneyiminizden bahsedebilir misiniz?", chunks: ["Can you tell me", "about", "your previous experience"], hiddenWord: "experience" },
      { id: 5, english: "I worked in a busy shop and helped customers every day.", turkish: "Yoğun bir mağazada çalıştım ve her gün müşterilere yardım ettim.", chunks: ["I worked", "in a busy shop", "and helped customers", "every day"], hiddenWord: "helped" },
      { id: 6, english: "What are your main strengths?", turkish: "Başlıca güçlü yönleriniz nelerdir?", chunks: ["What are", "your main strengths"], hiddenWord: "strengths" },
      { id: 7, english: "I listen carefully, stay calm, and enjoy working with a team.", turkish: "Dikkatle dinlerim, sakin kalırım ve bir ekiple çalışmaktan hoşlanırım.", chunks: ["I listen carefully", "stay calm", "and enjoy", "working with a team"], hiddenWord: "calm" },
      { id: 8, english: "That is good to hear. Do you have any questions for us?", turkish: "Bunu duymak güzel. Bize sormak istediğiniz bir şey var mı?", chunks: ["That is good", "to hear", "Do you have any questions"], hiddenWord: "questions" },
      { id: 9, english: "Yes. What does a normal day in this role look like?", turkish: "Evet. Bu pozisyonda normal bir gün nasıl geçiyor?", chunks: ["Yes", "What does a normal day", "in this role", "look like"], hiddenWord: "role" },
    ],
  },
  {
    id: "airport-check-in",
    lessonNumber: 10,
    seriesTitle: "Günlük Hayat İngilizcesi",
    title: "Airport Check-in",
    turkishTitle: "Havaalanında Check-in",
    level: "A2 · Seyahat",
    duration: "12–15 dakika",
    focusWords: ["passport", "boarding pass", "luggage", "window seat", "gate"],
    lines: [
      { id: 1, english: "Dilek is at the airport for her morning flight.", turkish: "Dilek sabah uçağı için havaalanında.", chunks: ["Dilek is", "at the airport", "for her morning flight"], hiddenWord: "flight" },
      { id: 2, english: "Good morning. May I see your passport, please?", turkish: "Günaydın. Pasaportunuzu görebilir miyim, lütfen?", chunks: ["Good morning", "May I see", "your passport please"], hiddenWord: "passport" },
      { id: 3, english: "Of course. I am checking in for the London flight.", turkish: "Elbette. Londra uçuşu için check-in yapıyorum.", chunks: ["Of course", "I am checking in", "for the London flight"], hiddenWord: "checking" },
      { id: 4, english: "Do you have any bags to check?", turkish: "Teslim edeceğiniz bagajınız var mı?", chunks: ["Do you have", "any bags", "to check"], hiddenWord: "bags" },
      { id: 5, english: "Yes, I have one suitcase and one small bag.", turkish: "Evet, bir valizim ve küçük bir çantam var.", chunks: ["Yes", "I have one suitcase", "and one small bag"], hiddenWord: "suitcase" },
      { id: 6, english: "Would you prefer an aisle seat or a window seat?", turkish: "Koridor koltuğu mu yoksa pencere kenarı mı tercih edersiniz?", chunks: ["Would you prefer", "an aisle seat", "or a window seat"], hiddenWord: "aisle" },
      { id: 7, english: "A window seat, please. Is the flight on time?", turkish: "Pencere kenarı olsun, lütfen. Uçuş zamanında mı?", chunks: ["A window seat please", "Is the flight", "on time"], hiddenWord: "window" },
      { id: 8, english: "Yes. Your gate is B12, and boarding starts at nine thirty.", turkish: "Evet. Kapınız B12 ve biniş dokuz buçukta başlıyor.", chunks: ["Yes", "Your gate is B12", "boarding starts", "at nine thirty"], hiddenWord: "boarding" },
    ],
  },
  {
    id: "a-phone-call",
    lessonNumber: 11,
    seriesTitle: "Günlük Hayat İngilizcesi",
    title: "A Phone Call",
    turkishTitle: "Telefon Görüşmesi",
    level: "A2 · İletişim",
    duration: "12–15 dakika",
    focusWords: ["speaking", "hold on", "repeat", "available", "message"],
    lines: [
      { id: 1, english: "Dilek is calling a company about a delivery.", turkish: "Dilek bir teslimat hakkında şirketi arıyor.", chunks: ["Dilek is calling", "a company", "about a delivery"], hiddenWord: "delivery" },
      { id: 2, english: "Hello, this is Dilek Kaya speaking.", turkish: "Merhaba, ben Dilek Kaya.", chunks: ["Hello", "this is", "Dilek Kaya speaking"], hiddenWord: "speaking" },
      { id: 3, english: "Hello, how can I help you today?", turkish: "Merhaba, bugün size nasıl yardımcı olabilirim?", chunks: ["Hello", "How can I help you", "today"], hiddenWord: "help" },
      { id: 4, english: "I am calling because my package has not arrived.", turkish: "Paketim gelmediği için arıyorum.", chunks: ["I am calling", "because my package", "has not arrived"], hiddenWord: "package" },
      { id: 5, english: "Could you give me your order number, please?", turkish: "Sipariş numaranızı verebilir misiniz, lütfen?", chunks: ["Could you give me", "your order number", "please"], hiddenWord: "order" },
      { id: 6, english: "Yes, it is four eight two six.", turkish: "Evet, dört sekiz iki altı.", chunks: ["Yes", "it is", "four eight two six"], hiddenWord: "four" },
      { id: 7, english: "Please hold on while I check the delivery status.", turkish: "Teslimat durumunu kontrol ederken lütfen bekleyin.", chunks: ["Please hold on", "while I check", "the delivery status"], hiddenWord: "hold" },
      { id: 8, english: "Thank you. Could you repeat the expected date?", turkish: "Teşekkürler. Tahmini tarihi tekrar edebilir misiniz?", chunks: ["Thank you", "Could you repeat", "the expected date"], hiddenWord: "repeat" },
      { id: 9, english: "It should arrive tomorrow before six o'clock.", turkish: "Yarın saat altıdan önce gelmeli.", chunks: ["It should arrive", "tomorrow", "before six o'clock"], hiddenWord: "tomorrow" },
    ],
  },
  {
    id: "giving-a-presentation",
    lessonNumber: 12,
    seriesTitle: "Günlük Hayat İngilizcesi",
    title: "Giving a Presentation",
    turkishTitle: "Sunum Yapma",
    level: "A2 · İş hayatı",
    duration: "12–15 dakika",
    focusWords: ["today I’ll talk about", "first", "finally", "questions", "thank you"],
    lines: [
      { id: 1, english: "Dilek is giving a short presentation at work.", turkish: "Dilek işte kısa bir sunum yapıyor.", chunks: ["Dilek is giving", "a short presentation", "at work"], hiddenWord: "presentation" },
      { id: 2, english: "Good morning, everyone. Thank you for joining me.", turkish: "Günaydın herkese. Bana katıldığınız için teşekkürler.", chunks: ["Good morning everyone", "Thank you", "for joining me"], hiddenWord: "joining" },
      { id: 3, english: "Today I’ll talk about our new customer service plan.", turkish: "Bugün yeni müşteri hizmetleri planımızdan bahsedeceğim.", chunks: ["Today I’ll talk about", "our new", "customer service plan"], hiddenWord: "plan" },
      { id: 4, english: "First, I will explain the main idea.", turkish: "Önce ana fikri açıklayacağım.", chunks: ["First", "I will explain", "the main idea"], hiddenWord: "first" },
      { id: 5, english: "Then, we will look at three simple improvements.", turkish: "Sonra üç basit gelişmeye bakacağız.", chunks: ["Then", "we will look at", "three simple improvements"], hiddenWord: "improvements" },
      { id: 6, english: "This chart shows how quickly we can answer customers.", turkish: "Bu grafik müşterilere ne kadar hızlı cevap verebileceğimizi gösteriyor.", chunks: ["This chart shows", "how quickly", "we can answer customers"], hiddenWord: "chart" },
      { id: 7, english: "Finally, I will share the next steps with you.", turkish: "Son olarak sonraki adımları sizinle paylaşacağım.", chunks: ["Finally", "I will share", "the next steps"], hiddenWord: "finally" },
      { id: 8, english: "That is all from me. Do you have any questions?", turkish: "Benden bu kadar. Sorunuz var mı?", chunks: ["That is all", "from me", "Do you have any questions"], hiddenWord: "questions" },
      { id: 9, english: "Thank you for listening.", turkish: "Dinlediğiniz için teşekkürler.", chunks: ["Thank you", "for listening"], hiddenWord: "listening" },
    ],
  },
];

export const STORY = STORIES[0];

export const MEMORY_STAGE_DETAILS: readonly MemoryStage[] = [
  { id: "meet", title: "Tanış", eyebrow: "1. Gün · 5 dakika", duration: "5 dk", description: "Hikâyeyi rahatça dinle ve oku. Ezberlemeye çalışma.", prompt: "İngilizce metni dinle. İstersen Türkçe anlam satırlarını aç; yalnızca hikâyenin akışını takip et." },
  { id: "chunk", title: "Parçala", eyebrow: "1. Gün · 5 dakika", duration: "5 dk", description: "Cümleleri kısa ses parçalarına ayırarak ritmi duy.", prompt: "Bir cümleyi seç. Önce parçaları tek tek, sonra tam cümleyi yavaşça sesli söyle." },
  { id: "repeat", title: "Tekrar Et", eyebrow: "1. Gün · 10 dakika", duration: "10 dk", description: "Dinle, duraklat ve aynı cümleyi kendi sesinle tekrar et.", prompt: "Her cümleden sonra kısa bir durak ver. Amacın aksanı mükemmelleştirmek değil, aynı ritmi yakalamak." },
  { id: "complete", title: "Tamamla", eyebrow: "1. Gün · 5 dakika", duration: "5 dk", description: "Hikâyedeki tanıdık kelimeleri görünce eksik kısmı hatırla.", prompt: "Örnek: “Could you ___ me, please?” Boşluğa önce zihninden “help” kelimesini getir, sonra cevabı göster." },
  { id: "recall", title: "Geri Çağır", eyebrow: "Ertesi gün · 5 dakika", duration: "5 dk", description: "Dün dinlediğin hikâyeden birkaç cümleyi sakin biçimde geri çağır.", prompt: "Türkçe anlamı gör ve İngilizce cümleyi aklına getir. Takılırsan cevabı açıp tekrar dinle." },
];

export function createInitialProgress(): StoryProgress {
  return { completedStageIds: [] };
}

export function completeStage(progress: StoryProgress, stageId: MemoryStageId): StoryProgress {
  if (progress.completedStageIds.includes(stageId) || !isStageUnlocked(progress, stageId)) {
    return progress;
  }
  return { completedStageIds: [...progress.completedStageIds, stageId] };
}

export function getCompletionPercent(progress: StoryProgress): number {
  return Math.round((new Set(progress.completedStageIds).size / MEMORY_STAGES.length) * 100);
}

export function isStageUnlocked(progress: StoryProgress, stageId: MemoryStageId): boolean {
  const stageIndex = MEMORY_STAGES.indexOf(stageId);
  return stageIndex === 0 || progress.completedStageIds.includes(MEMORY_STAGES[stageIndex - 1]);
}

export function buildSpeechText(story: Story = STORY): string {
  return story.lines.map((line) => line.english).join("\n");
}

export function getStoryByLesson(lessonNumber: number): Story | undefined {
  return STORIES.find((story) => story.lessonNumber === lessonNumber);
}

export function getNextStage(progress: StoryProgress): MemoryStageId | null {
  return MEMORY_STAGES.find((stageId) => !progress.completedStageIds.includes(stageId)) ?? null;
}
