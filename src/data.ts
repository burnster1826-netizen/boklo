import { Book, ChatSession, UserProfile } from './types';

// Famous Indian creative, residential and tech hubs matching BookLoop's audience
export const INDIAN_LOCATIONS = [
  { name: "Indiranagar, Bengaluru", state: "Karnataka", code: "BLR" },
  { name: "Koramangala, Bengaluru", state: "Karnataka", code: "BLR" },
  { name: "Bandra West, Mumbai", state: "Maharashtra", code: "BOM" },
  { name: "Hauz Khas, New Delhi", state: "Delhi", code: "DEL" },
  { name: "Salt Lake, Kolkata", state: "West Bengal", code: "CCU" },
  { name: "Adyar, Chennai", state: "Tamil Nadu", code: "MAA" },
  { name: "Banjara Hills, Hyderabad", state: "Telangana", code: "HYD" },
  { name: "Koregaon Park, Pune", state: "Maharashtra", code: "PNQ" }
];

export const INITIAL_USER: UserProfile = {
  name: "Elena Thorne",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDD6jYKtqzMy5u0quFotrcNChrjSBIRKoPYpq-fugsf-akwrt3x4RJ42z1V_E8sfje_gw1SZi4d2graYXPeY9dPDL3SMIOx8gJ2b-jBnxpuJuIxU3Sw6wJi6C8diUAzYpKthlCOlO189IeHUE0POjNr7QiOvkp796irWOmKMB0Kr4XYiluYHhsIbUh3Ui_STVVj4NiIqv-FQOvP96F-OfTjdC6ILEdNfIXtMwhuPvURRw2BUzA9qGB1qTUn2qq6rIGZ9vx-hp7CpiqS",
  location: "Koramangala, Bengaluru",
  isLocationGranted: false,
  rating: 4.9,
  swaps: 12,
  readingPersona: {
    title: "The Nocturnal Dreamer",
    genres: ["Sci-Fi", "Magic Realism", "Philosophy"]
  },
  likedBookIds: ["book-2"], // initially likes Meditations
  customLocationName: ""
};

export const INITIAL_BOOKS: Book[] = [
  {
    id: "book-1",
    title: "The Starless Sea",
    author: "Erin Morgenstern",
    price: 350, // in INR
    category: "Fiction",
    condition: "Like New",
    conditionDetails: "Unopened gift copy. Pristine paper edge quality with no highlighted text or annotations. Spine is tight and completely uncreased. Very slight scuff on back dust jacket.",
    location: "Koramangala, Bengaluru",
    distance: 1.2,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD2lj0gTEICUEY3Y1lPbXEvR4hvNpWCCdo9NUjuJLYo51coFJ0THNYqSeea0qYOsPxsa-NnzywardxB1IubeNRDg4anxCvauGORPfajcgEhim6RKpW5iZ__EFnTwOKjuuQazNs9yxI2awmOVhvd6DB2A2SQEuihDK_1Vy75JxfKZyDl53N9g3RSl5tXNMva1eFSjEs6CY_y3jVMSiCIH8aZf6r87Gs3u9jelfFlXO4NVtseuNAJhrCpADn8pPHioVtyb-qdxSKOVBAX",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCLh7Fy4Wx9U-sY3CKp4QfggsCbZERcdc7fxhRM6eQ505jpD6TKE3x577kTe5L-zBOFzDO-V5N3Rki1cpm5UfiBbdeTu55RnaThjYC99QpCMJFm19gLuBPBfYZ2YRAGUPLQBGVavF3Y7lssqRcLhneT6ibcQWCRUf6j38anO0tizLqtedLFtq_YufCzZTJJPBvSjdu2lE8580AIMtqE_AezCqk6sKWZLb3UCBzco9HkiwSZf00mnNW83wVPyWUkPySZlA6pkKqQjtkr"
    ],
    seller: {
      name: "Elena T.",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLT66UOMU05jK-59RuMPn4PtZJGAdVwbAI9uippuI52KkmZxLcTkJzGLtNrAfEc0CAAp7nrnJLXzA2WBTpw8x7rztmq4WBVPT5DRzc0naLMJ5WQSKdAHxljZUG75iZdoFNsSaKghvYzklpIX8syuiYbMu8h6A54o79aGCyv1wcDgCHZuLxxy_IAx1ZPZYm6yNweTbolPe3K-I_-j-m_6Trpmb7LE6_WmrzszQOsTCPAwwJHfLKRHoqoSE1zCs_XLQuT63bsBkXLT7Q",
      rating: 4.9,
      swaps: 12,
      isTrusted: true
    },
    language: "English",
    pages: 512,
    synopsis: "Far beneath the surface of the earth, upon the shores of the Starless Sea, there is a labyrinthine collection of tunnels and rooms filled with stories. When graduate student Zachary Rawlins discovers a mysterious book in his university library, he is drawn into an ancient secret society dedicated to protecting this beautiful underground sanctuary.",
    createdAt: "2026-05-28T18:30:00Z"
  },
  {
    id: "book-2",
    title: "Meditations",
    author: "Marcus Aurelius",
    price: 199,
    category: "Philosophy",
    condition: "Well-Loved",
    conditionDetails: "Dog-ears on several key pages, some light pencil annotations in the margins of Book 4. Spine is slightly worn but holds up beautifully.",
    location: "Indiranagar, Bengaluru",
    distance: 0.4,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCZepiR6mh9o3-H-f9m1cYa0EMcnXCoutu7X6gEo3zMNd5uLAcd-xoKcau8tpc6dw8Y6uWYbISIXnJTvzHuIaePuDPks6lTaYms2nqSAzooho3kgE4jTAcgvMWMAlob-NScAHfci7rttF1BfUK3U8w-QLPvGFLv64ErSw7jfdTHlbW4fVDyR129iDR2vdtm05bGTsr-HFM7w-PULHGNxl3j_A-QuYCyMkiJ_bArb7dP-KgxEawO5l_Gt8BiRkoAbP7evQnEOmT8IxVL"
    ],
    seller: {
      name: "Marcus A.",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvrGyXbjJ6XkrTQyrbTTv6T9NUoYQk7fO4VzW6YXakqyQuaCdWWTnHLnz37yjwo7ryQ9M33hQdg4-2v5eNVfw7zij7DS__-IoDYA2Pa4aFeW6BQrIWYOVGVBfEvynTCs-ztC2j_A1OLlWh5vRVk7VHi8Y98Axqu5EDKgDU6Cx-wjhP0hZPKI1xEAnJxZdpOUFO0uCpVwJosfqaMw97j7JaKVapc2-1bgxthgSWSPtZOMWpSnYhC_SuvxelOlSKHNypK0O3_vubV72O",
      rating: 4.8,
      swaps: 24,
      isTrusted: true
    },
    language: "English",
    pages: 256,
    synopsis: "The private notes of the Roman Emperor Marcus Aurelius offer a series of spiritual exercises and reflections developed as he struggled to understand himself and make sense of the universe. These writings are one of the greatest guides to Stoic philosophy ever created.",
    createdAt: "2026-05-27T10:15:00Z"
  },
  {
    id: "book-3",
    title: "Foundation",
    author: "Isaac Asimov",
    price: 450,
    category: "Sci-Fi",
    condition: "Very Good",
    conditionDetails: "Clean cover and tight spine. No severe creases. Minor yellowing of pages due to natural aging but pristine inside.",
    location: "Bandra West, Mumbai",
    distance: 3.1,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBB8LM_H-xi4IT8ZwzpR-qTee48JkLrpFF9twgwAIpKu8CXA-ekRJSXQomQ6o7JW450Hlpeob9E-6n3JXB1-iciFhTeQ2kop_E2ok_hyC2BvTmKB2RdJIBqFwUFkESZtt-UK0fixn8OGMnWK19ZuxTogHl8Qk-DA2uEqZFvou6HpUTnabTOKPt4-9fija-E57VGOi5mTn_ZBXMBZ9WKqHo8YQeY71LuN1_q6TyTN_HmfBWsQew7Jq8e8SB3vFTPNGNIRQzLux9iBhHa"
    ],
    seller: {
      name: "Hari S.",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuClBnvXSjpwPT1Ee1lECLazDg1UjZYQbtuA_c0GISBPAHCkv3VtBO34annX5pEpKD3erYKJX4WiYtgRaIIkNp3vnmMc48TqKppo5cyWYT-MfhIYCwrGn6uhaa4WZZMlYaLM-CNsw1mn29hnW8NP4hUlhanEpODw1LGOV-NwWzYGexURAcYXPvCZcR_OE5gk8F1YrpZwgN424Vf5KVnfBjQwY8yew1J4nVIZ5nDvMWvjfUwbxhp-xatE1K7Zl0knlHJlJLsm-hwO7-KM",
      rating: 4.9,
      swaps: 110,
      isTrusted: true
    },
    language: "English",
    pages: 320,
    synopsis: "The Galactic Empire has ruled supreme for twelve thousand years. Now it is dying. Only Hari Seldon, creator of the revolutionary science of psychohistory, can foresee the dark age of ignorance and barbarism that lies ahead. To preserve knowledge and save mankind, Seldon gathers the empire's best minds in a lonely world to establish the Foundation.",
    createdAt: "2026-05-29T08:00:00Z"
  },
  {
    id: "book-4",
    title: "Leafy Hollows",
    author: "Elena Thorne",
    price: 299,
    category: "Poetry",
    condition: "Like New",
    conditionDetails: "Bought directly from the local author. Unmarked, tight backing, custom fabric hardcover cover feels incredibly premium.",
    location: "Koramangala, Bengaluru",
    distance: 0.8,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBoZdhlmcpGtntjEOFNgUsdHmhxLcPQR-HXy9T4tXS19RYn9ctESZ3DsO-ZDd7dFp9mwEPwr1893PlNoE8m3XT6sEWuCavEC-RN1_foaPj6O9WfFLKeFsoN1DkfWuONM3PqN3uPqk9II01J8EMUy96HFJ8zxeMS6Vgn-iwt1rZnmDcgx4BvAfYE0RtObno6jm28R7Yy8uo39dMRBcK5_PyG5cnOVhPgbGMr0PpFoa6CnJFwLP9Hjmy9Y9otEjT0dGVPBEKmb39ypo5t",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD064usXm_bX7xO3A4YNyb0JNAOxcIBELacxS8JqVcQ4rlpNoeJkmOWI55doY4WtMpJGnH553DqfCSw50hc30r-S5fgnz-tT65oKfvNUf1je79GiGMwymzvRmrO5INyH5ZpAx-_y-xdea1i6mAIKb6a7QaOz2qGK8lyZU0r80Q84Gqs2z8dd1gbXOrX2HodAtBP8Huef-L0Z1Cuplydrv0JhKY0XT6xW3ZTugo-SxXHeAaEhXRwvZTk6tZOwWmaVQuUUhW9CiIcD4hc"
    ],
    seller: {
      name: "Elena Thorne",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDD6jYKtqzMy5u0quFotrcNChrjSBIRKoPYpq-fugsf-akwrt3x4RJ42z1V_E8sfje_gw1SZi4d2graYXPeY9dPDL3SMIOx8gJ2b-jBnxpuJuIxU3Sw6wJi6C8diUAzYpKthlCOlO189IeHUE0POjNr7QiOvkp796irWOmKMB0Kr4XYiluYHhsIbUh3Ui_STVVj4NiIqv-FQOvP96F-OfTjdC6ILEdNfIXtMwhuPvURRw2BUzA9qGB1qTUn2qq6rIGZ9vx-hp7CpiqS",
      rating: 4.9,
      swaps: 12
    },
    language: "English",
    pages: 180,
    synopsis: "A curated compilation of nocturnal poetry expressing the magic of silent city streets, rustling leaves under lamp posts, and old libraries smelling of aged leather and ink. An immersive read for late-night dreamers.",
    createdAt: "2026-05-29T11:00:00Z"
  },
  {
    id: "school-12",
    title: "CBSE XII Chemistry Vol. 1",
    author: "NCERT Editorial",
    price: 150,
    category: "School Book",
    subcategory: "12th",
    condition: "Like New",
    conditionDetails: "Like new copy, no folds, no markings. Kept in a pet-free home.",
    location: "Koramangala, Bengaluru",
    distance: 1.5,
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuCLh7Fy4Wx9U-sY3CKp4QfggsCbZERcdc7fxhRM6eQ505jpD6TKE3x577kTe5L-zBOFzDO-V5N3Rki1cpm5UfiBbdeTu55RnaThjYC99QpCMJFm19gLuBPBfYZ2YRAGUPLQBGVavF3Y7lssqRcLhneT6ibcQWCRUf6j38anO0tizLqtedLFtq_YufCzZTJJPBvSjdu2lE8580AIMtqE_AezCqk6sKWZLb3UCBzco9HkiwSZf00mnNW83wVPyWUkPySZlA6pkKqQjtkr"],
    seller: {
      name: "Ramesh K.",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLT66UOMU05jK-59RuMPn4PtZJGAdVwbAI9uippuI52KkmZxLcTkJzGLtNrAfEc0CAAp7nrnJLXzA2WBTpw8x7rztmq4WBVPT5DRzc0naLMJ5WQSKdAHxljZUG75iZdoFNsSaKghvYzklpIX8syuiYbMu8h6A54o79aGCyv1wcDgCHZuLxxy_IAx1ZPZYm6yNweTbolPe3K-I_-j-m_6Trpmb7LE6_WmrzszQOsTCPAwwJHfLKRHoqoSE1zCs_XLQuT63bsBkXLT7Q",
      rating: 4.7,
      swaps: 5
    },
    language: "English",
    pages: 420,
    synopsis: "Official NCERT Chemistry Part 1 textbook for syllabus grade 12th.",
    createdAt: "2026-05-29T12:00:00Z"
  },
  {
    id: "school-11",
    title: "CBSE XI Physics Part 2",
    author: "NCERT Editorial",
    price: 180,
    category: "School Book",
    subcategory: "11th",
    condition: "Very Good",
    conditionDetails: "Good quality, minor pencil notes on some pages, otherwise clean text.",
    location: "Koramangala, Bengaluru",
    distance: 2.1,
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuCLh7Fy4Wx9U-sY3CKp4QfggsCbZERcdc7fxhRM6eQ505jpD6TKE3x577kTe5L-zBOFzDO-V5N3Rki1cpm5UfiBbdeTu55RnaThjYC99QpCMJFm19gLuBPBfYZ2YRAGUPLQBGVavF3Y7lssqRcLhneT6ibcQWCRUf6j38anO0tizLqtedLFtq_YufCzZTJJPBvSjdu2lE8580AIMtqE_AezCqk6sKWZLb3UCBzco9HkiwSZf00mnNW83wVPyWUkPySZlA6pkKqQjtkr"],
    seller: {
      name: "Priya S.",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvrGyXbjJ6XkrTQyrbTTv6T9NUoYQk7fO4VzW6YXakqyQuaCdWWTnHLnz37yjwo7ryQ9M33hQdg4-2v5eNVfw7zij7DS__-IoDYA2Pa4aFeW6BQrIWYOVGVBfEvynTCs-ztC2j_A1OLlWh5vRVk7VHi8Y98Axqu5EDKgDU6Cx-wjhP0hZPKI1xEAnJxZdpOUFO0uCpVwJosfqaMw97j7JaKVapc2-1bgxthgSWSPtZOMWpSnYhC_SuvxelOlSKHNypK0O3_vubV72O",
      rating: 4.8,
      swaps: 8
    },
    language: "English",
    pages: 380,
    synopsis: "Official NCERT Physics textbook for eleventh standard secondary curriculum.",
    createdAt: "2026-05-29T14:30:00Z"
  },
  {
    id: "school-10",
    title: "CBSE X Mathematics Textbook",
    author: "NCERT Editorial",
    price: 120,
    category: "School Book",
    subcategory: "10th",
    condition: "Well-Loved",
    conditionDetails: "Used for board exams. Highlights on geometry theory, covers are reinforced.",
    location: "Koramangala, Bengaluru",
    distance: 0.9,
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuCLh7Fy4Wx9U-sY3CKp4QfggsCbZERcdc7fxhRM6eQ505jpD6TKE3x577kTe5L-zBOFzDO-V5N3Rki1cpm5UfiBbdeTu55RnaThjYC99QpCMJFm19gLuBPBfYZ2YRAGUPLQBGVavF3Y7lssqRcLhneT6ibcQWCRUf6j38anO0tizLqtedLFtq_YufCzZTJJPBvSjdu2lE8580AIMtqE_AezCqk6sKWZLb3UCBzco9HkiwSZf00mnNW83wVPyWUkPySZlA6pkKqQjtkr"],
    seller: {
      name: "Rohit M.",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuClBnvXSjpwPT1Ee1lECLazDg1UjZYQbtuA_c0GISBPAHCkv3VtBO34annX5pEpKD3erYKJX4WiYtgRaIIkNp3vnmMc48TqKppo5cyWYT-MfhIYCwrGn6uhaa4WZZMlYaLM-CNsw1mn29hnW8NP4hUlhanEpODw1LGOV-NwWzYGexURAcYXPvCZcR_OE5gk8F1YrpZwgN424Vf5KVnfBjQwY8yew1J4nVIZ5nDvMWvjfUwbxhp-xatE1K7Zl0knlHJlJLsm-hwO7-KM",
      rating: 4.5,
      swaps: 15
    },
    language: "English",
    pages: 450,
    synopsis: "Official NCERT Mathematics textbook containing complete secondary school curriculum and board exam patterns.",
    createdAt: "2026-05-29T16:00:00Z"
  },
  {
    id: "free-1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    price: 0,
    category: "Fiction",
    condition: "Very Good",
    conditionDetails: "Slight folding on page edges but perfectly clean text.",
    location: "Koramangala, Bengaluru",
    distance: 1.8,
    images: ["https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300"],
    seller: {
      name: "Prashant S.",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvrGyXbjJ6XkrTQyrbTTv6T9NUoYQk7fO4VzW6YXakqyQuaCdWWTnHLnz37yjwo7ryQ9M33hQdg4-2v5eNVfw7zij7DS__-IoDYA2Pa4aFeW6BQrIWYOVGVBfEvynTCs-ztC2j_A1OLlWh5vRVk7VHi8Y98Axqu5EDKgDU6Cx-wjhP0hZPKI1xEAnJxZdpOUFO0uCpVwJosfqaMw97j7JaKVapc2-1bgxthgSWSPtZOMWpSnYhC_SuvxelOlSKHNypK0O3_vubV72O",
      rating: 4.7,
      swaps: 3
    },
    language: "English",
    pages: 180,
    synopsis: "Jay Gatsby, a wealthy and mysterious young man, throws lavish parties in his Long Island mansion but remains lonely, obsessed with his old love, Daisy Buchanan.",
    createdAt: "2026-05-30T09:00:00Z"
  },
  {
    id: "free-2",
    title: "Siddhartha",
    author: "Hermann Hesse",
    price: 0,
    category: "Philosophy",
    condition: "Like New",
    conditionDetails: "Gifted book, never read. It deserves a beautiful home.",
    location: "Koramangala, Bengaluru",
    distance: 0.5,
    images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300"],
    seller: {
      name: "Elena Thorne",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDD6jYKtqzMy5u0quFotrcNChrjSBIRKoPYpq-fugsf-akwrt3x4RJ42z1V_E8sfje_gw1SZi4d2graYXPeY9dPDL3SMIOx8gJ2b-jBnxpuJuIxU3Sw6wJi6C8diUAzYpKthlCOlO189IeHUE0POjNr7QiOvkp796irWOmKMB0Kr4XYiluYHhsIbUh3Ui_STVVj4NiIqv-FQOvP96F-OfTjdC6ILEdNfIXtMwhuPvURRw2BUzA9qGB1qTUn2qq6rIGZ9vx-hp7CpiqS",
      rating: 4.9,
      swaps: 12
    },
    language: "English",
    pages: 150,
    synopsis: "A classic novel that chronicles the spiritual journey of self-discovery of a man named Siddhartha during the time of the Gautama Buddha.",
    createdAt: "2026-05-30T14:00:00Z"
  }
];

export const INITIAL_CHATS: ChatSession[] = [
  {
    id: "chat-1",
    participant: {
      id: "seller-elena",
      name: "Elena T.",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLT66UOMU05jK-59RuMPn4PtZJGAdVwbAI9uippuI52KkmZxLcTkJzGLtNrAfEc0CAAp7nrnJLXzA2WBTpw8x7rztmq4WBVPT5DRzc0naLMJ5WQSKdAHxljZUG75iZdoFNsSaKghvYzklpIX8syuiYbMu8h6A54o79aGCyv1wcDgCHZuLxxy_IAx1ZPZYm6yNweTbolPe3K-I_-j-m_6Trpmb7LE6_WmrzszQOsTCPAwwJHfLKRHoqoSE1zCs_XLQuT63bsBkXLT7Q",
      rating: 4.9,
      unreadCount: 1,
      isOnline: true
    },
    book: {
      id: "book-4",
      title: "Leafy Hollows",
      price: 299,
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuBoZdhlmcpGtntjEOFNgUsdHmhxLcPQR-HXy9T4tXS19RYn9ctESZ3DsO-ZDd7dFp9mwEPwr1893PlNoE8m3XT6sEWuCavEC-RN1_foaPj6O9WfFLKeFsoN1DkfWuONM3PqN3uPqk9II01J8EMUy96HFJ8zxeMS6Vgn-iwt1rZnmDcgx4BvAfYE0RtObno6jm28R7Yy8uo39dMRBcK5_PyG5cnOVhPgbGMr0PpFoa6CnJFwLP9Hjmy9Y9otEjT0dGVPBEKmb39ypo5t"
    },
    messages: [
      {
        id: "msg-1",
        sender: "them",
        text: "Hi there! I'm interested in trading 'Leafy Hollows'. Is it still available for the listed price?",
        timestamp: "Yesterday, 8:42 PM"
      },
      {
        id: "msg-2",
        sender: "me",
        text: "Yes, it is! It's in great condition, just some light shelf wear on the spine. Are you in the city?",
        timestamp: "Yesterday, 8:45 PM"
      },
      {
        id: "msg-3",
        sender: "them",
        text: "Perfect. I am! I'm usually near West Village in the evenings. Would you be open to meeting halfway tomorrow?",
        timestamp: "Yesterday, 8:47 PM"
      },
      {
        id: "msg-4",
        sender: "me",
        text: "West Village works for me. I'll be finishing up at the library around 6 PM. How about we meet there?",
        timestamp: "Today, 10:15 AM"
      },
      {
        id: "msg-5",
        sender: "me",
        text: "Let's meet at the Indiranagar Public Book Exchange corner near the library entrance.",
        timestamp: "Today, 10:16 AM",
        isMeetingPoint: true,
        meetingLocation: "Indiranagar Public Book Corner"
      },
      {
        id: "msg-6",
        sender: "them",
        text: "That sounds great. I'll see you at 6 PM near the main entrance!",
        timestamp: "Today, 10:22 AM"
      }
    ]
  },
  {
    id: "chat-2",
    participant: {
      id: "seller-marcus",
      name: "Marcus A.",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvrGyXbjJ6XkrTQyrbTTv6T9NUoYQk7fO4VzW6YXakqyQuaCdWWTnHLnz37yjwo7ryQ9M33hQdg4-2v5eNVfw7zij7DS__-IoDYA2Pa4aFeW6BQrIWYOVGVBfEvynTCs-ztC2j_A1OLlWh5vRVk7VHi8Y98Axqu5EDKgDU6Cx-wjhP0hZPKI1xEAnJxZdpOUFO0uCpVwJosfqaMw97j7JaKVapc2-1bgxthgSWSPtZOMWpSnYhC_SuvxelOlSKHNypK0O3_vubV72O",
      rating: 4.8,
      unreadCount: 0,
      isOnline: false
    },
    book: {
      id: "book-2",
      title: "Meditations",
      price: 199,
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZepiR6mh9o3-H-f9m1cYa0EMcnXCoutu7X6gEo3zMNd5uLAcd-xoKcau8tpc6dw8Y6uWYbISIXnJTvzHuIaePuDPks6lTaYms2nqSAzooho3kgE4jTAcgvMWMAlob-NScAHfci7rttF1BfUK3U8w-QLPvGFLv64ErSw7jfdTHlbW4fVDyR129iDR2vdtm05bGTsr-HFM7w-PULHGNxl3j_A-QuYCyMkiJ_bArb7dP-KgxEawO5l_Gt8BiRkoAbP7evQnEOmT8IxVL"
    },
    messages: [
      {
        id: "m1-1",
        sender: "them",
        text: "Hello! Is 'Meditations' still available for sale?",
        timestamp: "Yesterday, 3:30 PM"
      },
      {
        id: "m1-2",
        sender: "me",
        text: "Yes, absolutely! Are you looking to buy it?",
        timestamp: "Yesterday, 3:45 PM"
      },
      {
        id: "m1-3",
        sender: "them",
        text: "The condition is like new, no highlights.",
        timestamp: "Yesterday, 4:00 PM"
      }
    ]
  },
  {
    id: "chat-3",
    participant: {
      id: "seller-sarah",
      name: "Sarah Webb",
      avatar: "", // empty so S.W. initials show up beautifully exactly like the mockup!
      rating: 4.5,
      unreadCount: 1,
      isOnline: false
    },
    book: {
      id: "book-1",
      title: "The Starless Sea",
      price: 350,
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2lj0gTEICUEY3Y1lPbXEvR4hvNpWCCdo9NUjuJLYo51coFJ0THNYqSeea0qYOsPxsa-NnzywardxB1IubeNRDg4anxCvauGORPfajcgEhim6RKpW5iZ__EFnTwOKjuuQazNs9yxI2awmOVhvd6DB2A2SQEuihDK_1Vy75JxfKZyDl53N9g3RSl5tXNMva1eFSjEs6CY_y3jVMSiCIH8aZf6r87Gs3u9jelfFlXO4NVtseuNAJhrCpADn8pPHioVtyb-qdxSKOVBAX"
    },
    messages: [
      {
        id: "m2-1",
        sender: "them",
        text: "I can give a discount if you buy 'The Secret History' too!",
        timestamp: "Wednesday, 11:15 AM"
      }
    ]
  },
  {
    id: "chat-4",
    participant: {
      id: "seller-julian",
      name: "Julian",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuClBnvXSjpwPT1Ee1lECLazDg1UjZYQbtuA_c0GISBPAHCkv3VtBO34annX5pEpKD3erYKJX4WiYtgRaIIkNp3vnmMc48TqKppo5cyWYT-MfhIYCwrGn6uhaa4WZZMlYaLM-CNsw1mn29hnW8NP4hUlhanEpODw1LGOV-NwWzYGexURAcYXPvCZcR_OE5gk8F1YrpZwgN424Vf5KVnfBjQwY8yew1J4nVIZ5nDvMWvjfUwbxhp-xatE1K7Zl0knlHJlJLsm-hwO7-KM",
      rating: 4.7,
      unreadCount: 0,
      isOnline: false
    },
    book: {
      id: "book-3",
      title: "Foundation",
      price: 450,
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuBB8LM_H-xi4IT8ZwzpR-qTee48JkLrpFF9twgwAIpKu8CXA-ekRJSXQomQ6o7JW450Hlpeob9E-6n3JXB1-iciFhTeQ2kop_E2ok_hyC2BvTmKB2RdJIBqFwUFkESZtt-UK0fixn8OGMnWK19ZuxTogHl8Qk-DA2uEqZFvou6HpUTnabTOKPt4-9fija-E57VGOi5mTn_ZBXMBZ9WKqHo8YQeY71LuN1_q6TyTN_HmfBWsQew7Jq8e8SB3vFTPNGNIRQzLux9iBhHa"
    },
    messages: [
      {
        id: "m3-1",
        sender: "them",
        text: "Thanks for the smooth trade!",
        timestamp: "Monday, 2:40 PM"
      }
    ]
  }
];

export const LOCATION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Koramangala, Bengaluru": { lat: 12.9352, lng: 77.6245 },
  "Indiranagar, Bengaluru": { lat: 12.9719, lng: 77.6412 },
  "Bandra West, Mumbai": { lat: 19.0596, lng: 72.8295 },
  "Hauz Khas, New Delhi": { lat: 28.5494, lng: 77.2001 },
  "Salt Lake, Kolkata": { lat: 22.5804, lng: 88.4378 },
  "Adyar, Chennai": { lat: 13.0012, lng: 80.2565 },
  "Banjara Hills, Hyderabad": { lat: 17.4156, lng: 78.4347 },
  "Koregaon Park, Pune": { lat: 18.5362, lng: 73.8930 }
};

export function getBookCoordinates(book: Book): { lat: number; lng: number } {
  const center = LOCATION_COORDINATES[book.location] || { lat: 12.9352, lng: 77.6245 };
  
  let hash = 0;
  for (let i = 0; i < book.id.length; i++) {
    hash = book.id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const angle = (Math.abs(hash) % 360) * (Math.PI / 180);
  
  const latOffset = (book.distance * Math.sin(angle)) / 111.12;
  const lngOffset = (book.distance * Math.cos(angle)) / (111.12 * Math.cos(center.lat * Math.PI / 180));
  
  return {
    lat: center.lat + latOffset,
    lng: center.lng + lngOffset
  };
}

