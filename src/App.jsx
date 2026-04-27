import { useState, useRef, useCallback, useEffect, useMemo } from "react";

// ─── Audio Engine (Web Audio API) ───
const AudioEngine = (() => {
  let ctx = null;
  const getCtx = () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  };
  const playTone = (freq, dur, type = "sine", vol = 0.15) => {
    try {
      const c = getCtx(), o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(vol, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      o.connect(g); g.connect(c.destination);
      o.start(); o.stop(c.currentTime + dur);
    } catch (e) {}
  };
  return {
    correct() {
      playTone(523, 0.12, "sine", 0.18);
      setTimeout(() => playTone(659, 0.12, "sine", 0.18), 100);
      setTimeout(() => playTone(784, 0.2, "sine", 0.2), 200);
    },
    wrong() {
      playTone(200, 0.15, "square", 0.1);
      setTimeout(() => playTone(160, 0.25, "square", 0.1), 120);
    },
    drop() { playTone(440, 0.08, "sine", 0.1); },
    pickup() { playTone(600, 0.06, "sine", 0.08); },
    levelUp() {
      [523, 659, 784, 1047].forEach((f, i) =>
        setTimeout(() => playTone(f, 0.2, "sine", 0.15), i * 120));
    },
    click() { playTone(800, 0.04, "sine", 0.06); }
  };
})();

// ─── Voice Engine ───
const speak = (text, lang) => {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "ka" ? "ka-GE" : "en-US";
    u.rate = 0.85; u.pitch = 1.2; u.volume = 0.8;
    window.speechSynthesis.speak(u);
  } catch (e) {}
};

// ─── Translations ───
const T = {
  en: {
    title: "Sort It Out!",
    subtitle: "Drag each item to the right bin!",
    organic: "Organic", paper: "Paper", plastic: "Plastic", glass: "Glass", metal: "Metal",
    level: "Level", score: "Score",
    correct: ["Great job! 🌟", "Awesome! 💚", "You got it! 🎯", "Perfect! ✨", "Wonderful! 🌈", "Earth thanks you! 🌍"],
    wrong: ["Hmm, try again!", "Not quite!", "Almost!", "Try another bin!", "Oops, which bin?"],
    hint: "Look for the glowing bin! 💡",
    levelComplete: "Level Complete!",
    next: "Next Level", replay: "Play Again", home: "Home",
    gameComplete: "You're a Recycling Hero! 🦸",
    startGame: "Start Game",
    garbageFacts: [
      "A glass bottle takes up to 1 million years to decompose!",
      "Plastic bags can take 500 years to break down in a landfill!",
      "The average person throws away 4.5 pounds of trash every day!",
      "Aluminum cans can be recycled forever without losing quality!",
      "A single disposable diaper takes 500 years to decompose!",
      "Food waste in landfills creates methane, a powerful greenhouse gas!",
      "Every year, 8 million tons of plastic end up in the ocean!",
      "A plastic bottle can last 450 years in the environment!",
      "Styrofoam never fully decomposes — it just breaks into smaller pieces!",
      "E-waste is the fastest growing waste stream in the world!",
      "Cigarette butts are the most littered item on Earth!",
      "One recycled tin can saves enough energy to power a TV for 3 hours!",
      "Paper makes up about 26% of landfill waste!",
      "Batteries contain toxic chemicals that leak into soil and water!"
    ],
    earthFacts: [
      "🌍 Recycling one ton of paper saves 17 trees and 7,000 gallons of water!",
      "🌊 Beach cleanups worldwide removed over 300 million pounds of trash!",
      "🌱 Composting reduces landfill waste by up to 30%!",
      "♻️ Germany recycles 67% of its waste — the highest rate in the world!",
      "🐢 Banning single-use plastics cut beach litter by 40% in many places!",
      "🌳 Recycling aluminum saves 95% of the energy needed to make new cans!",
      "💧 Reusing a water bottle for one year saves 156 plastic bottles!",
      "🐝 Community gardens on former landfills are bringing back pollinators!",
      "🏙️ San Francisco diverts 80% of its waste from landfills!",
      "🌿 Japan's recycling is so good, some towns achieve zero-waste!",
      "☀️ Recycled glass reduces related air pollution by 20%!",
      "🐋 Ocean cleanup projects removed over 200,000 kg of plastic from the sea!",
      "🏔️ Rwanda banned plastic bags in 2008 and is now one of the cleanest nations!",
      "🌻 Worm composting turns food scraps into rich soil in just 3 months!"
    ],
    items: {
      banana_peel: "Banana Peel", apple_core: "Apple Core", eggshell: "Eggshell",
      leaves: "Leaves", carrot_top: "Carrot Top", tea_bag: "Tea Bag",
      orange_peel: "Orange Peel", corn_cob: "Corn Cob", coffee_grounds: "Coffee Grounds",
      grass: "Grass Clippings", flower: "Wilted Flower", bread: "Stale Bread",
      newspaper: "Newspaper", cardboard: "Cardboard Box", notebook: "Notebook",
      paper_bag: "Paper Bag", envelope: "Envelope", magazine: "Magazine",
      tissue_box: "Tissue Box", wrapping: "Gift Wrap", paper_plate: "Paper Plate",
      cereal_box: "Cereal Box", paper_cup: "Paper Cup", receipt: "Receipt",
      water_bottle: "Water Bottle", plastic_bag: "Plastic Bag", yogurt_cup: "Yogurt Cup",
      straw: "Plastic Straw", shampoo: "Shampoo Bottle", food_wrap: "Plastic Wrap",
      detergent: "Detergent Jug", toy: "Broken Toy", pen: "Old Pen",
      bottle_cap: "Bottle Cap", takeout_box: "Takeout Box", cd: "Old CD",
      glass_jar: "Glass Jar", glass_bottle: "Glass Bottle", mirror: "Mirror Piece",
      light_bulb: "Light Bulb", wine_glass: "Broken Glass", vase: "Flower Vase",
      perfume: "Perfume Bottle", candle_jar: "Candle Jar", pickle_jar: "Pickle Jar",
      soda_can: "Soda Can", tin_can: "Tin Can", aluminum_foil: "Foil",
      battery: "Battery", old_key: "Old Key", coin: "Old Coin",
      paint_can: "Paint Can", wire: "Metal Wire", nail: "Nails",
      spoon: "Metal Spoon", lid: "Metal Lid", hanger: "Wire Hanger"
    }
  },
  ka: {
    title: "დაალაგე!",
    subtitle: "გადაიტანე ნაგავი სწორ ურნაში!",
    organic: "ორგანული", paper: "ქაღალდი", plastic: "პლასტმასი", glass: "მინა", metal: "ლითონი",
    level: "დონე", score: "ქულა",
    correct: ["მშვენიერია! 🌟", "ყოჩაღ! 💚", "სწორია! 🎯", "შესანიშნავი! ✨", "ბრავო! 🌈", "დედამიწა გმადლობს! 🌍"],
    wrong: ["სცადე თავიდან!", "არა მთლად!", "თითქმის!", "სცადე სხვა ურნა!", "უპს, რომელი ურნა?"],
    hint: "მოძებნე მოციმციმე ურნა! 💡",
    levelComplete: "დონე დასრულდა!",
    next: "შემდეგი", replay: "თავიდან", home: "მთავარი",
    gameComplete: "შენ გადამუშავების გმირი ხარ! 🦸",
    startGame: "დაიწყე",
    garbageFacts: [
      "მინის ბოთლს 1 მილიონი წელი სჭირდება დასაშლელად!",
      "პლასტიკურ პარკს ნაგავსაყრელზე 500 წელი სჭირდება!",
      "საშუალო ადამიანი დღეში 2 კგ ნაგავს ყრის!",
      "ალუმინის ქილა შეიძლება სამუდამოდ გადამუშავდეს!",
      "ერთ საფენს 500 წელი სჭირდება დასაშლელად!",
      "საკვების ნარჩენები ნაგავსაყრელზე მეთანს ქმნიან!",
      "ყოველწლიურად 8 მილიონი ტონა პლასტმასი ოკეანეში ხვდება!",
      "პლასტმასის ბოთლი 450 წელს ძლებს გარემოში!",
      "პენოპლასტი არასოდეს იშლება სრულად!",
      "ელექტრონული ნაგავი ყველაზე სწრაფად მზარდი ტიპია!",
      "სიგარეტის ნამწვავი ყველაზე ხშირად დაყრილი ნაგავია!",
      "ერთი გადამუშავებული ქილა 3 საათის ტელევიზორს უტოლდება!",
      "ქაღალდი ნაგავსაყრელის 26%-ს შეადგენს!",
      "ბატარეებში ტოქსიკური ქიმიკატები ნიადაგში ჟონავს!"
    ],
    earthFacts: [
      "🌍 1 ტონა ქაღალდის გადამუშავება 17 ხეს და 26,000 ლიტრ წყალს ზოგავს!",
      "🌊 სანაპიროების დასუფთავებამ 136 მილიონ კგ ნაგავი ამოიღო!",
      "🌱 კომპოსტირება ნაგავსაყრელის 30%-ით ამცირებს!",
      "♻️ გერმანია ნაგვის 67%-ს ამუშავებს — მსოფლიოში პირველია!",
      "🐢 ერთჯერადი პლასტმასის აკრძალვამ სანაპიროზე ნაგავი 40%-ით შეამცირა!",
      "🌳 ალუმინის გადამუშავება ენერგიის 95%-ს ზოგავს!",
      "💧 წყლის ბოთლის 1 წლით გამოყენება 156 ბოთლს ზოგავს!",
      "🐝 ყოფილ ნაგავსაყრელებზე ბაღები მტვერსაფრქვევებს აბრუნებს!",
      "🏙️ სან-ფრანცისკო ნაგვის 80%-ს ნაგავსაყრელისგან არიდებს!",
      "🌿 იაპონიის ზოგიერთი ქალაქი ნულოვან ნარჩენებს აღწევს!",
      "☀️ გადამუშავებული მინა ჰაერის დაბინძურებას 20%-ით ამცირებს!",
      "🐋 ოკეანის გაწმენდამ 200,000 კგ-ზე მეტი პლასტმასი ამოიღო!",
      "🏔️ რუანდამ პლასტიკური პარკები აკრძალა და უსუფთავესი ქვეყანაა!",
      "🌻 ჭიის კომპოსტი საკვებს 3 თვეში ნოყიერ ნიადაგად აქცევს!"
    ],
    items: {
      banana_peel: "ბანანის კანი", apple_core: "ვაშლის გული", eggshell: "კვერცხის ნაჭუჭი",
      leaves: "ფოთლები", carrot_top: "სტაფილოს თავი", tea_bag: "ჩაის პაკეტი",
      orange_peel: "ფორთოხლის კანი", corn_cob: "სიმინდის ტარო", coffee_grounds: "ყავის ნალექი",
      grass: "მოთიბული ბალახი", flower: "დაჭკნობილი ყვავილი", bread: "გაფუჭებული პური",
      newspaper: "გაზეთი", cardboard: "მუყაოს ყუთი", notebook: "რვეული",
      paper_bag: "ქაღალდის პარკი", envelope: "კონვერტი", magazine: "ჟურნალი",
      tissue_box: "ხელსახოცის ყუთი", wrapping: "საჩუქრის ქაღალდი", paper_plate: "ქაღალდის თეფში",
      cereal_box: "მარცვლეულის ყუთი", paper_cup: "ქაღალდის ჭიქა", receipt: "ჩეკი",
      water_bottle: "წყლის ბოთლი", plastic_bag: "პლასტიკური პარკი", yogurt_cup: "იოგურტის ჭიქა",
      straw: "საწრუპავი", shampoo: "შამპუნის ბოთლი", food_wrap: "საჭმლის პლასტიკი",
      detergent: "სარეცხის ბოთლი", toy: "გატეხილი სათამაშო", pen: "ძველი კალამი",
      bottle_cap: "თავსახური", takeout_box: "კონტეინერი", cd: "ძველი CD",
      glass_jar: "მინის ქილა", glass_bottle: "მინის ბოთლი", mirror: "სარკის ნაჭერი",
      light_bulb: "ნათურა", wine_glass: "გატეხილი ჭიქა", vase: "ვაზა",
      perfume: "სუნამოს ბოთლი", candle_jar: "სანთლის ქილა", pickle_jar: "მწნილის ქილა",
      soda_can: "ლიმონათის ქილა", tin_can: "კონსერვის ქილა", aluminum_foil: "ფოლგა",
      battery: "ბატარეა", old_key: "ძველი გასაღები", coin: "ძველი მონეტა",
      paint_can: "საღებავის ქილა", wire: "მავთული", nail: "ლურსმანი",
      spoon: "ლითონის კოვზი", lid: "ლითონის სახურავი", hanger: "საკიდი"
    }
  }
};

// ─── Game Data ───
const CATEGORIES = [
  { id: "organic", color: "#5D8C2A", bgColor: "#E8F5D4", emoji: "🍂" },
  { id: "paper", color: "#3B7DD8", bgColor: "#DBE9FA", emoji: "📰" },
  { id: "plastic", color: "#E09B13", bgColor: "#FFF4D6", emoji: "🧴" },
  { id: "glass", color: "#1D9E5C", bgColor: "#D4F2E4", emoji: "🫙" },
  { id: "metal", color: "#C43E3E", bgColor: "#FAE0E0", emoji: "🥫" }
];

const ALL_ITEMS = [
  { id: "banana_peel", cat: "organic", emoji: "🍌" },
  { id: "apple_core", cat: "organic", emoji: "🍎" },
  { id: "eggshell", cat: "organic", emoji: "🥚" },
  { id: "leaves", cat: "organic", emoji: "🍃" },
  { id: "carrot_top", cat: "organic", emoji: "🥕" },
  { id: "tea_bag", cat: "organic", emoji: "🍵" },
  { id: "orange_peel", cat: "organic", emoji: "🍊" },
  { id: "corn_cob", cat: "organic", emoji: "🌽" },
  { id: "coffee_grounds", cat: "organic", emoji: "☕" },
  { id: "grass", cat: "organic", emoji: "🌿" },
  { id: "flower", cat: "organic", emoji: "🥀" },
  { id: "bread", cat: "organic", emoji: "🍞" },
  { id: "newspaper", cat: "paper", emoji: "📰" },
  { id: "cardboard", cat: "paper", emoji: "📦" },
  { id: "notebook", cat: "paper", emoji: "📓" },
  { id: "paper_bag", cat: "paper", emoji: "🛍️" },
  { id: "envelope", cat: "paper", emoji: "✉️" },
  { id: "magazine", cat: "paper", emoji: "📖" },
  { id: "tissue_box", cat: "paper", emoji: "🧻" },
  { id: "wrapping", cat: "paper", emoji: "🎁" },
  { id: "paper_plate", cat: "paper", emoji: "🍽️" },
  { id: "cereal_box", cat: "paper", emoji: "🥣" },
  { id: "paper_cup", cat: "paper", emoji: "☕" },
  { id: "receipt", cat: "paper", emoji: "🧾" },
  { id: "water_bottle", cat: "plastic", emoji: "🧴" },
  { id: "plastic_bag", cat: "plastic", emoji: "🛍️" },
  { id: "yogurt_cup", cat: "plastic", emoji: "🥛" },
  { id: "straw", cat: "plastic", emoji: "🥤" },
  { id: "shampoo", cat: "plastic", emoji: "🫧" },
  { id: "food_wrap", cat: "plastic", emoji: "🎞️" },
  { id: "detergent", cat: "plastic", emoji: "🧹" },
  { id: "toy", cat: "plastic", emoji: "🧸" },
  { id: "pen", cat: "plastic", emoji: "🖊️" },
  { id: "bottle_cap", cat: "plastic", emoji: "⚪" },
  { id: "takeout_box", cat: "plastic", emoji: "🥡" },
  { id: "cd", cat: "plastic", emoji: "💿" },
  { id: "glass_jar", cat: "glass", emoji: "🫙" },
  { id: "glass_bottle", cat: "glass", emoji: "🍾" },
  { id: "mirror", cat: "glass", emoji: "🪞" },
  { id: "light_bulb", cat: "glass", emoji: "💡" },
  { id: "wine_glass", cat: "glass", emoji: "🥂" },
  { id: "vase", cat: "glass", emoji: "🏺" },
  { id: "perfume", cat: "glass", emoji: "🌸" },
  { id: "candle_jar", cat: "glass", emoji: "🕯️" },
  { id: "pickle_jar", cat: "glass", emoji: "🥒" },
  { id: "soda_can", cat: "metal", emoji: "🥫" },
  { id: "tin_can", cat: "metal", emoji: "🥫" },
  { id: "aluminum_foil", cat: "metal", emoji: "🪩" },
  { id: "battery", cat: "metal", emoji: "🔋" },
  { id: "old_key", cat: "metal", emoji: "🔑" },
  { id: "coin", cat: "metal", emoji: "🪙" },
  { id: "paint_can", cat: "metal", emoji: "🎨" },
  { id: "wire", cat: "metal", emoji: "〰️" },
  { id: "nail", cat: "metal", emoji: "🔩" },
  { id: "spoon", cat: "metal", emoji: "🥄" },
  { id: "lid", cat: "metal", emoji: "⭕" },
  { id: "hanger", cat: "metal", emoji: "🪝" }
];

const LEVELS = [
  { itemCount: 6, cats: ["organic", "paper", "plastic"] },
  { itemCount: 8, cats: ["organic", "paper", "plastic", "glass"] },
  { itemCount: 10, cats: ["organic", "paper", "plastic", "glass", "metal"] }
];

const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [b[i], b[j]] = [b[j], b[i]]; } return b; };
const pick = a => a[Math.random() * a.length | 0];

// ─── Confetti ───
function Confetti({ active }) {
  if (!active) return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999 }}>
      {Array.from({ length: 45 }, (_, i) => (
        <div key={i} style={{
          position: "absolute", left: `${Math.random() * 100}%`, top: "-12px",
          width: `${6 + Math.random() * 10}px`, height: `${6 + Math.random() * 10}px`,
          background: ["#FFD700","#FF6B6B","#4ECDC4","#A78BFA","#FF9F43","#2EAD6D","#FF69B4"][i % 7],
          borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          animation: `confettiFall ${1.5 + Math.random()}s ease-out ${Math.random() * 0.6}s forwards`
        }} />
      ))}
    </div>
  );
}

// ─── Bin SVG ───
function BinSVG({ category, isTarget, isWrong, isCorrect, count = 0 }) {
  const cat = CATEGORIES.find(c => c.id === category);
  const anim = isWrong ? "binShake 0.5s ease" : isCorrect ? "binBounce 0.5s ease" : isTarget ? "binGlow 1s ease-in-out infinite" : "";
  return (
    <div style={{
      animation: anim, transition: "filter 0.3s",
      filter: isTarget ? `brightness(1.1) drop-shadow(0 0 14px ${cat.color}88)` : ""
    }}>
      <svg viewBox="0 0 120 150" width="100%" style={{ display: "block" }}>
        <defs>
          <linearGradient id={`bg-${cat.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={cat.color} />
            <stop offset="100%" stopColor={cat.color} stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <ellipse cx="60" cy="140" rx="38" ry="5" fill="rgba(0,0,0,0.07)" />
        <rect x="18" y="44" width="84" height="86" rx="10" fill={`url(#bg-${cat.id})`} />
        <rect x="24" y="48" width="72" height="78" rx="8" fill={cat.bgColor} opacity="0.4" />
        <rect x="12" y="32" width="96" height="18" rx="9" fill={cat.color} />
        <rect x="42" y="22" width="36" height="16" rx="8" fill={cat.color} />
        <ellipse cx="60" cy="27" rx="10" ry="4" fill={cat.bgColor} opacity="0.3" />
        {/* Eyes */}
        {isCorrect ? (<>
          <path d="M37 74 Q43 67 49 74" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M71 74 Q77 67 83 74" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>) : (<>
          <ellipse cx="43" cy="74" rx="8" ry="8" fill="white" />
          <ellipse cx="77" cy="74" rx="8" ry="8" fill="white" />
          <circle cx="44" cy="75" r="4.5" fill="#333" />
          <circle cx="78" cy="75" r="4.5" fill="#333" />
          <circle cx="45.5" cy="73" r="2" fill="white" />
          <circle cx="79.5" cy="73" r="2" fill="white" />
        </>)}
        {/* Mouth */}
        {isCorrect
          ? <path d="M38 94 Q60 114 82 94" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          : isWrong
            ? <path d="M42 100 Q60 88 78 100" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            : <path d="M40 94 Q60 106 80 94" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        }
        <circle cx="30" cy="88" r="6" fill={cat.color} opacity="0.25" />
        <circle cx="90" cy="88" r="6" fill={cat.color} opacity="0.25" />
        <text x="60" y="128" textAnchor="middle" fontSize="18">{cat.emoji}</text>
        {count > 0 && <>
          <circle cx="96" cy="44" r="12" fill="#FFD700" stroke="white" strokeWidth="2" />
          <text x="96" y="49" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#333" fontFamily="sans-serif">{count}</text>
        </>}
      </svg>
    </div>
  );
}

function Stars({ count, size = 28 }) {
  return (
    <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
      {[1, 2, 3].map(i => (
        <span key={i} style={{
          fontSize: `${size}px`,
          filter: i <= count ? "none" : "grayscale(1) opacity(0.25)",
          animation: i <= count ? `starPop 0.4s ease ${i * 0.15}s both` : "none",
          display: "inline-block"
        }}>⭐</span>
      ))}
    </div>
  );
}

function ProgressDots({ total, sorted }) {
  return (
    <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: "10px", height: "10px", borderRadius: "50%",
          background: i < sorted ? "#4ECDC4" : "rgba(255,255,255,0.5)",
          transition: "all 0.3s",
          transform: i < sorted ? "scale(1.2)" : "scale(1)",
          border: "2px solid rgba(255,255,255,0.6)"
        }} />
      ))}
    </div>
  );
}

// ─── Main ───
export default function SortItOut() {
  const [lang, setLang] = useState("en");
  const [screen, setScreen] = useState("menu");
  const [level, setLevel] = useState(0);
  const [items, setItems] = useState([]);
  const [sortedItems, setSortedItems] = useState(new Set());
  const [sortedCounts, setSortedCounts] = useState({});
  const [dragItemState, setDragItemState] = useState(null);
  const [dragPos, setDragPos] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [roundMistakes, setRoundMistakes] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [levelStars, setLevelStars] = useState([0, 0, 0]);
  const [soundOn, setSoundOn] = useState(true);
  const [voiceOn, setVoiceOn] = useState(true);

  const binRefs = useRef({});
  const dragRef = useRef(null);
  const containerRef = useRef(null);
  const feedbackTimer = useRef(null);

  const t = T[lang];
  const levelConfig = LEVELS[level];
  const fontFamily = lang === "ka" ? "'Noto Sans Georgian','Fredoka',sans-serif" : "'Fredoka',sans-serif";

  // Persistent storage
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("sort-it-out-progress");
        if (res?.value) {
          const d = JSON.parse(res.value);
          if (d.levelStars) setLevelStars(d.levelStars);
        }
      } catch (e) {}
    })();
  }, []);

  const saveProgress = useCallback(async (stars) => {
    try {
      await window.storage.set("sort-it-out-progress", JSON.stringify({ levelStars: stars, ts: Date.now() }));
    } catch (e) {}
  }, []);

  const startLevel = useCallback((lvl) => {
    const config = LEVELS[lvl];
    const available = ALL_ITEMS.filter(i => config.cats.includes(i.cat));
    const perCat = Math.ceil(config.itemCount / config.cats.length);
    let selected = [];
    config.cats.forEach(cat => {
      selected.push(...shuffle(available.filter(i => i.cat === cat)).slice(0, perCat));
    });
    selected = shuffle(selected).slice(0, config.itemCount);
    setItems(selected);
    setSortedItems(new Set());
    setSortedCounts({});
    setDragItemState(null);
    setDragPos(null);
    setFeedback(null);
    setWrongAttempts(0);
    setShowHint(false);
    setRoundMistakes(0);
    setScore(0);
    setScreen("play");
  }, []);

  const handlePointerDown = useCallback((e, item) => {
    if (sortedItems.has(item.id)) return;
    e.preventDefault();
    e.target.setPointerCapture?.(e.pointerId);
    dragRef.current = item;
    setDragItemState(item);
    setShowHint(false);
    setFeedback(null);
    const rect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    setDragPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    if (soundOn) AudioEngine.pickup();
    if (voiceOn) speak(t.items[item.id], lang);
  }, [sortedItems, soundOn, voiceOn, t, lang]);

  const handlePointerMove = useCallback((e) => {
    if (!dragRef.current) return;
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    setDragPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleDrop = useCallback((binCatId) => {
    const item = dragRef.current;
    if (!item || sortedItems.has(item.id)) return;
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);

    if (item.cat === binCatId) {
      if (soundOn) AudioEngine.correct();
      setFeedback({ type: "correct", binId: binCatId, message: pick(t.correct) });
      const newSorted = new Set([...sortedItems, item.id]);
      setSortedItems(newSorted);
      setSortedCounts(prev => ({ ...prev, [binCatId]: (prev[binCatId] || 0) + 1 }));
      setScore(prev => prev + 10);
      setWrongAttempts(0);
      setShowHint(false);

      feedbackTimer.current = setTimeout(() => {
        setFeedback(null);
        if (newSorted.size >= items.length) {
          const stars = roundMistakes === 0 ? 3 : roundMistakes <= 2 ? 2 : 1;
          const ns = [...levelStars];
          ns[level] = Math.max(ns[level], stars);
          setLevelStars(ns);
          saveProgress(ns);
          setShowConfetti(true);
          if (soundOn) AudioEngine.levelUp();
          setTimeout(() => setShowConfetti(false), 2500);
          setScreen(level >= 2 ? "gameComplete" : "levelComplete");
        }
      }, 1000);
    } else {
      if (soundOn) AudioEngine.wrong();
      setFeedback({ type: "wrong", binId: binCatId, message: pick(t.wrong) });
      setRoundMistakes(prev => prev + 1);
      setWrongAttempts(prev => { if (prev + 1 >= 2) setShowHint(true); return prev + 1; });
      feedbackTimer.current = setTimeout(() => setFeedback(null), 1000);
    }
  }, [sortedItems, items, t, level, levelStars, roundMistakes, soundOn, saveProgress]);

  const handlePointerUp = useCallback((e) => {
    if (!dragRef.current) return;
    const activeCats = LEVELS[level].cats;
    for (const catId of activeCats) {
      const el = binRefs.current[catId];
      if (el) {
        const rect = el.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
          if (soundOn) AudioEngine.drop();
          handleDrop(catId);
          dragRef.current = null;
          setDragItemState(null);
          setDragPos(null);
          return;
        }
      }
    }
    dragRef.current = null;
    setDragItemState(null);
    setDragPos(null);
  }, [handleDrop, level, soundOn]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const mv = (e) => { if (dragRef.current) { e.preventDefault(); const r = el.getBoundingClientRect(); setDragPos({ x: e.clientX - r.left, y: e.clientY - r.top }); } };
    const up = (e) => { if (dragRef.current) handlePointerUp(e); };
    const cancel = () => { dragRef.current = null; setDragItemState(null); setDragPos(null); };
    el.addEventListener("pointermove", mv, { passive: false });
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", cancel);
    return () => { el.removeEventListener("pointermove", mv); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", cancel); };
  }, [handlePointerUp]);

  const activeCats = levelConfig ? CATEGORIES.filter(c => levelConfig.cats.includes(c.id)) : [];

  const currentFact = useMemo(() => {
    const all = [...t.garbageFacts, ...t.earthFacts];
    return all[Math.floor(Math.random() * all.length)];
  }, [screen, t]);

  return (
    <div ref={containerRef} style={{
      minHeight: "100vh", fontFamily, touchAction: "none",
      background: "linear-gradient(160deg, #FFF3E0 0%, #FFE0B2 20%, #B2DFDB 50%, #C8E6C9 80%, #E8F5E9 100%)",
      overflow: "hidden", position: "relative", userSelect: "none"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Noto+Sans+Georgian:wght@400;500;600;700&display=swap');
        @keyframes confettiFall { 0%{transform:translateY(0) rotate(0);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
        @keyframes binShake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-8px) rotate(-4deg)} 30%{transform:translateX(8px) rotate(4deg)} 45%{transform:translateX(-5px) rotate(-2deg)} 60%{transform:translateX(5px) rotate(2deg)} 75%{transform:translateX(-2px)} }
        @keyframes binBounce { 0%{transform:scale(1)} 25%{transform:scale(1.18)} 50%{transform:scale(0.92)} 75%{transform:scale(1.06)} 100%{transform:scale(1)} }
        @keyframes binGlow { 0%,100%{transform:scale(1);filter:brightness(1)} 50%{transform:scale(1.06);filter:brightness(1.2)} }
        @keyframes itemAppear { 0%{transform:scale(0) rotate(-15deg);opacity:0} 70%{transform:scale(1.08) rotate(3deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
        @keyframes starPop { 0%{transform:scale(0) rotate(-30deg)} 60%{transform:scale(1.35) rotate(10deg)} 100%{transform:scale(1) rotate(0)} }
        @keyframes floatUp { 0%{transform:translate(-50%,-50%) scale(1);opacity:1} 100%{transform:translate(-50%,-120%) scale(1.1);opacity:0} }
        @keyframes slideUp { 0%{transform:translateY(30px);opacity:0} 100%{transform:translateY(0);opacity:1} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        @keyframes wobble { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
        @keyframes bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes rainbow { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .tb { padding:5px 12px; border-radius:16px; border:2px solid rgba(255,255,255,0.8); font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s; backdrop-filter:blur(4px); }
        .tb.on { background:rgba(255,255,255,0.85); color:#2EAD6D; }
        .tb.off { background:rgba(0,0,0,0.12); color:rgba(255,255,255,0.8); }
        .pb { padding:16px 48px; border-radius:50px; border:none; font-size:22px; font-weight:700; cursor:pointer; color:white; background:linear-gradient(135deg,#4ECDC4,#2EAD6D,#44BD32); background-size:200% 200%; animation:rainbow 3s ease infinite; box-shadow:0 6px 24px rgba(46,173,109,0.35); transition:all 0.2s; }
        .pb:hover{transform:scale(1.05)} .pb:active{transform:scale(0.97)}
        .ic { width:82px; height:100px; margin:5px; background:white; border-radius:16px; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:grab; box-shadow:0 3px 12px rgba(0,0,0,0.08); border:2.5px solid #f0f0f0; transition:transform 0.15s,box-shadow 0.15s; touch-action:none; }
        .ic:hover{transform:scale(1.05);box-shadow:0 5px 18px rgba(0,0,0,0.12)}
      `}</style>

      <Confetti active={showConfetti} />

      {/* Floating drag ghost */}
      {dragItemState && dragPos && (
        <div style={{
          position: "absolute", left: dragPos.x - 45, top: dragPos.y - 55,
          width: "90px", height: "110px", zIndex: 1000, pointerEvents: "none",
          background: "white", borderRadius: "18px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)", display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
          transform: "rotate(-5deg) scale(1.12)", border: "3px solid #4ECDC4",
          transition: "none"
        }}>
          <span style={{ fontSize: "38px" }}>{dragItemState.emoji}</span>
          <span style={{ fontSize: "10px", fontWeight: 600, color: "#555", padding: "0 6px", textAlign: "center", fontFamily }}>
            {t.items[dragItemState.id]}
          </span>
        </div>
      )}

      {/* Top bar */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "8px 10px", display: "flex", justifyContent: "flex-end",
        gap: "4px", alignItems: "center"
      }}>
        <button className={`tb ${soundOn?"on":"off"}`} onClick={() => { setSoundOn(!soundOn); AudioEngine.click(); }}>
          {soundOn ? "🔊" : "🔇"}
        </button>
        <button className={`tb ${voiceOn?"on":"off"}`} onClick={() => setVoiceOn(!voiceOn)}>
          {voiceOn ? "🗣️" : "🤐"}
        </button>
        <div style={{ display: "flex", background: "rgba(78,205,196,0.65)", borderRadius: "20px", padding: "3px" }}>
          {[["en","EN"],["ka","ქარ"]].map(([c,l]) => (
            <button key={c} className={`tb ${lang===c?"on":"off"}`}
              style={{ border: "none", fontFamily: c==="ka"?"'Noto Sans Georgian',sans-serif":"'Fredoka',sans-serif" }}
              onClick={() => { setLang(c); if(soundOn) AudioEngine.click(); }}>{l}</button>
          ))}
        </div>
      </div>

      {/* ═══ MENU ═══ */}
      {screen === "menu" && (
        <div style={{
          display:"flex", flexDirection:"column", alignItems:"center",
          justifyContent:"center", minHeight:"100vh", padding:"60px 20px 20px", textAlign:"center"
        }}>
          <div style={{ animation:"wobble 3s ease-in-out infinite", marginBottom:"8px" }}>
            <span style={{ fontSize:"72px" }}>🌍</span>
          </div>
          <h1 style={{
            fontSize:"clamp(34px,8vw,52px)", fontWeight:700, margin:"8px 0",
            background:"linear-gradient(135deg,#2EAD6D,#4ECDC4,#3B7DD8)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"
          }}>{t.title}</h1>
          <p style={{ fontSize:"clamp(15px,3vw,19px)", color:"#666", marginBottom:"24px", fontWeight:500 }}>
            {t.subtitle}
          </p>
          <div style={{ display:"flex", gap:"10px", marginBottom:"24px", flexWrap:"wrap", justifyContent:"center" }}>
            {CATEGORIES.map((cat, i) => (
              <div key={cat.id} style={{ animation:`slideUp 0.5s ease ${i*0.1}s both`, width:"62px", textAlign:"center" }}>
                <BinSVG category={cat.id} />
                <div style={{ fontSize:"11px", fontWeight:700, color:cat.color, marginTop:"2px" }}>{t[cat.id]}</div>
              </div>
            ))}
          </div>
          {levelStars.some(s=>s>0) && (
            <div style={{ display:"flex", gap:"16px", marginBottom:"18px", padding:"10px 20px", background:"rgba(255,255,255,0.55)", borderRadius:"16px" }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:"11px", color:"#888", fontWeight:600 }}>{t.level} {i+1}</div>
                  <Stars count={levelStars[i]} size={18} />
                </div>
              ))}
            </div>
          )}
          <button className="pb" style={{ fontFamily }}
            onClick={() => { setLevel(0); startLevel(0); if(soundOn) AudioEngine.click(); }}>
            {t.startGame} 🎮
          </button>
          <div style={{
            marginTop:"22px", padding:"14px 20px", background:"rgba(255,255,255,0.5)",
            borderRadius:"16px", maxWidth:"360px", fontSize:"13px", color:"#555",
            lineHeight:1.5, fontWeight:500
          }}>
            💡 {pick([...t.garbageFacts, ...t.earthFacts])}
          </div>
        </div>
      )}

      {/* ═══ PLAY ═══ */}
      {screen === "play" && (
        <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh", padding:"48px 10px 10px" }}>
          {/* Header */}
          <div style={{
            display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"8px 14px", background:"rgba(255,255,255,0.6)",
            borderRadius:"14px", marginBottom:"8px", backdropFilter:"blur(6px)", flexWrap:"wrap", gap:"6px"
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <button onClick={() => { setScreen("menu"); if(soundOn) AudioEngine.click(); }}
                style={{ background:"rgba(255,255,255,0.7)", border:"2px solid #ddd", borderRadius:"10px", padding:"4px 8px", cursor:"pointer", fontSize:"14px", lineHeight:1 }}
                title={t.home}>🏠</button>
              <div style={{ fontWeight:700, color:"#2EAD6D", fontSize:"15px" }}>🌿 {t.level} {level+1}</div>
            </div>
            <ProgressDots total={items.length} sorted={sortedItems.size} />
            <div style={{ fontWeight:600, color:"#555", fontSize:"14px" }}>{t.score}: {score}</div>
          </div>

          {/* Hint */}
          {showHint && dragItemState && !sortedItems.has(dragItemState.id) && (
            <div style={{
              textAlign:"center", padding:"6px 14px", background:"rgba(255,215,0,0.25)",
              borderRadius:"12px", marginBottom:"6px", fontSize:"13px", fontWeight:600, color:"#B8860B"
            }}>{t.hint}</div>
          )}

          {/* Feedback */}
          {feedback && (
            <div style={{
              position:"fixed", top:"45%", left:"50%", transform:"translate(-50%,-50%)",
              padding:"14px 28px", borderRadius:"24px", zIndex:500, pointerEvents:"none",
              background: feedback.type==="correct"
                ? "linear-gradient(135deg,#4ECDC4,#2EAD6D)"
                : "linear-gradient(135deg,#FF6B6B,#EE5A24)",
              color:"white", fontWeight:700, fontSize:"clamp(16px,4vw,22px)",
              animation:"floatUp 1.3s ease-out forwards",
              boxShadow:"0 8px 30px rgba(0,0,0,0.2)"
            }}>{feedback.message}</div>
          )}

          {/* Items */}
          <div style={{
            display:"flex", flexWrap:"wrap", justifyContent:"center", alignContent:"center",
            padding:"10px 6px", background:"rgba(255,255,255,0.4)",
            borderRadius:"20px", marginBottom:"12px", flex:1, minHeight:"120px"
          }}>
            {items.map((item, i) => {
              const sorted = sortedItems.has(item.id);
              const dragging = dragItemState?.id === item.id;
              if (sorted) return <div key={item.id} style={{ width:"82px", height:"100px", margin:"5px", opacity:0 }} />;
              return (
                <div key={item.id} className="ic"
                  style={{
                    animation: `itemAppear 0.4s ease-out ${i*0.06}s both`,
                    opacity: dragging ? 0.3 : 1,
                    transform: dragging ? "scale(0.9)" : undefined
                  }}
                  onPointerDown={(e) => handlePointerDown(e, item)}
                >
                  <span style={{ fontSize:"34px", marginBottom:"3px", lineHeight:1 }}>{item.emoji}</span>
                  <span style={{ fontSize:"9.5px", fontWeight:600, textAlign:"center", padding:"0 5px", color:"#555", lineHeight:1.2, fontFamily }}>{t.items[item.id]}</span>
                </div>
              );
            })}
          </div>

          {/* Bins */}
          <div style={{ display:"flex", justifyContent:"center", gap:"6px", padding:"8px 2px" }}>
            {activeCats.map(cat => (
              <div key={cat.id} ref={el => binRefs.current[cat.id] = el}
                style={{ flex:`1 1 ${100/activeCats.length}%`, maxWidth:"110px", textAlign:"center" }}>
                <BinSVG category={cat.id}
                  isTarget={showHint && dragItemState && dragItemState.cat === cat.id}
                  isWrong={feedback?.type==="wrong" && feedback.binId===cat.id}
                  isCorrect={feedback?.type==="correct" && feedback.binId===cat.id}
                  count={sortedCounts[cat.id]||0}
                />
                <div style={{ fontSize:"11px", fontWeight:700, color:cat.color, marginTop:"2px" }}>{t[cat.id]}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ LEVEL COMPLETE ═══ */}
      {screen === "levelComplete" && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:"20px", textAlign:"center" }}>
          <span style={{ fontSize:"56px", marginBottom:"8px", animation:"bob 2s ease-in-out infinite" }}>🎉</span>
          <h2 style={{ fontSize:"clamp(26px,6vw,36px)", color:"#2EAD6D", fontWeight:700, margin:"0 0 12px" }}>{t.levelComplete}</h2>
          <Stars count={levelStars[level]} size={40} />
          <p style={{ fontSize:"18px", color:"#555", margin:"12px 0", fontWeight:500 }}>{t.score}: {score}</p>
          <div style={{ background:"rgba(255,255,255,0.6)", borderRadius:"18px", padding:"16px 22px", marginBottom:"24px", maxWidth:"340px" }}>
            <p style={{ fontSize:"14px", color:"#555", margin:0, lineHeight:1.6, fontWeight:500 }}>{currentFact}</p>
          </div>
          <button className="pb" style={{ fontFamily }}
            onClick={() => { setLevel(level+1); startLevel(level+1); if(soundOn) AudioEngine.click(); }}>
            {t.next} ➡️
          </button>
        </div>
      )}

      {/* ═══ GAME COMPLETE ═══ */}
      {screen === "gameComplete" && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:"20px", textAlign:"center" }}>
          <span style={{ fontSize:"72px", animation:"wobble 2s ease-in-out infinite" }}>🏆</span>
          <h2 style={{
            fontSize:"clamp(24px,5.5vw,36px)", fontWeight:700, margin:"12px 0",
            background:"linear-gradient(135deg,#FFD700,#FF9F43,#FF6B6B)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"
          }}>{t.gameComplete}</h2>
          <div style={{ display:"flex", gap:"18px", margin:"12px 0 20px" }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ textAlign:"center", animation:`slideUp 0.4s ease ${i*0.15}s both` }}>
                <div style={{ fontSize:"12px", fontWeight:600, color:"#888", marginBottom:"4px" }}>{t.level} {i+1}</div>
                <Stars count={levelStars[i]} size={26} />
              </div>
            ))}
          </div>
          <div style={{ background:"rgba(255,255,255,0.6)", borderRadius:"18px", padding:"16px 22px", marginBottom:"20px", maxWidth:"340px" }}>
            <p style={{ fontSize:"14px", color:"#555", margin:0, lineHeight:1.6, fontWeight:500 }}>{currentFact}</p>
          </div>
          <button className="pb" style={{ fontFamily, marginBottom:"10px" }}
            onClick={() => { setLevel(0); setLevelStars([0,0,0]); startLevel(0); if(soundOn) AudioEngine.click(); }}>
            {t.replay} 🔄
          </button>
          <button style={{
            padding:"10px 28px", borderRadius:"30px", border:"2px solid #2EAD6D",
            background:"transparent", color:"#2EAD6D", fontWeight:600, fontSize:"16px", cursor:"pointer", fontFamily
          }} onClick={() => { setScreen("menu"); if(soundOn) AudioEngine.click(); }}>
            🏠 {t.home}
          </button>
        </div>
      )}
    </div>
  );
}