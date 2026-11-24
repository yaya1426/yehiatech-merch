export const CURRENCY = 'ج.م'

// Channel link shown in the About section and footer.
export const YOUTUBE_URL = 'https://www.youtube.com/@YehiaTech'

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']

// ink: colour of the logo and text on that garment colour.
export const products = {
  hoodie: {
    id: 'hoodie',
    name: 'هودي Selected',
    file: 'hoodie.fig',
    price: 950,
    sizes: SIZES,
    colors: [
      { id: 'black', name: 'أسود', hex: '#141414', ink: 'yellow' },
      { id: 'white', name: 'أبيض', hex: '#FAFAF7', ink: 'black' },
      { id: 'heather-grey', name: 'رمادي', hex: '#B9B9B9', ink: 'black' },
      { id: 'burgundy', name: 'نبيتي', hex: '#6D1F2C', ink: 'yellow' },
      { id: 'navy', name: 'كحلي', hex: '#1B2A49', ink: 'yellow' },
    ],
    image: (c) => `products/hoodie-${c}.webp`,
  },
  tee: {
    id: 'tee',
    name: 'تيشيرت git diff',
    file: 'tshirt.diff',
    price: 450,
    sizes: SIZES,
    colors: [
      { id: 'white', name: 'أبيض', hex: '#FAFAF7', ink: 'black' },
      { id: 'black', name: 'أسود', hex: '#141414', ink: 'yellow' },
      { id: 'heather-grey', name: 'رمادي', hex: '#B9B9B9', ink: 'black' },
      { id: 'burgundy', name: 'نبيتي', hex: '#6D1F2C', ink: 'yellow' },
    ],
    image: (c) => `products/tee-${c}.webp`,
  },
  mug: {
    id: 'mug',
    name: 'مج context window',
    file: 'mug.ctx',
    price: 280,
    colors: [
      { id: 'matte-black', name: 'أسود مطفي', hex: '#161616', ink: 'yellow', inner: '#161616', rough: 0.82 },
      { id: 'white', name: 'أبيض', hex: '#F7F6F1', ink: 'black', inner: '#F7F6F1', rough: 0.28 },
      { id: 'yellow', name: 'أصفر', hex: '#FFD60A', ink: 'black', inner: '#F7F6F1', rough: 0.45 },
    ],
    image: (c) => `products/mug-${c}.webp`,
  },
  stickers: {
    id: 'stickers',
    name: 'باك استيكرز اللابتوب',
    file: 'stickers.keys',
    price: 120,
    colors: [{ id: 'pack', name: '6 استيكرز', hex: '#FFD60A', ink: 'black' }],
    image: () => 'products/stickers-pack.webp',
  },
}

export const dropOrder = ['hoodie', 'tee', 'mug', 'stickers']

export const dropNotes = {
  hoodie: 'اللوجو على الصدر… وهو لسه متحدد.',
  tee: 'سطر اتمسح، وسطر اتضاف.',
  mug: 'القهوة هي الـ context بتاعك.',
  stickers: 'ستة استيكرز، وكل واحد بنكتة.',
}

export const stickers = [
  { id: 'cmdz', file: 'print/sticker-key-cmdz.svg', w: 313, h: 313, label: '⌘Z ارجع' },
  { id: 'esc', file: 'print/sticker-key-esc.svg', w: 313, h: 313, label: 'Esc اهرب' },
  { id: 'enter', file: 'print/sticker-key-enter.svg', w: 433, h: 313, label: 'Enter يلا' },
  { id: 'typing', file: 'print/sticker-typing.svg', w: 413, h: 283, label: 'يحيى بيكتب…' },
  { id: 'skeleton', file: 'print/sticker-skeleton.svg', w: 333, h: 373, label: 'اللوجو وهو بيحمّل' },
  { id: 'aaa', file: 'print/sticker-aaa.svg', w: 333, h: 373, label: 'AAA contrast' },
]

export const sizeTable = {
  hoodie: [
    ['S', 68, 58], ['M', 70, 61], ['L', 72, 64], ['XL', 74, 67], ['XXL', 76, 70],
  ],
  tee: [
    ['S', 70, 52], ['M', 72, 55], ['L', 74, 58], ['XL', 76, 61], ['XXL', 78, 64],
  ],
}

export const specs = [
  { title: 'الهودي', items: ['قطن تقيل 400 جم', 'قصّة واسعة شوية', 'طباعة سكرين برنت على الصدر', 'خمس ألوان'] },
  { title: 'التيشيرت', items: ['قطن 220 جم', 'رقبة مدوّرة', 'طباعة سكرين برنت بلونين', 'أربع ألوان'] },
  { title: 'المج', items: ['سيراميك 330 مل', 'الشريط حوالين المج كله', 'اللوجو صغير على الوش التاني', 'ينفع في غسالة الأطباق'] },
  { title: 'الاستيكرز', items: ['ستة استيكرز فينيل', 'ضد المية والخدش', 'قصّة die-cut بحد أبيض', 'للابتوب أو أي سطح ناعم'] },
]

export const faq = [
  {
    q: 'المتجر ده حقيقي؟',
    a: 'لسه. ده متجر تجريبي عشان نشوف الأفكار والشكل. مفيش بيع ولا دفع دلوقتي.',
  },
  {
    q: 'الخامات إيه؟',
    a: 'الهودي والتيشيرت قطن تقيل والطباعة سكرين برنت. المج سيراميك 330 مل، والاستيكرز فينيل ضد المية.',
  },
  {
    q: 'أختار المقاس إزاي؟',
    a: 'القصّة واسعة شوية. لو إنت بين مقاسين خد الأصغر، وجدول المقاسات موجود فوق.',
  },
  {
    q: 'لون اللوجو بيتغير؟',
    a: 'أيوه. أصفر على الألوان الغامقة، وأسود على الألوان الفاتحة. عشان الكونتراست يفضل AAA.',
  },
  {
    q: 'هتشحنوا فين؟',
    a: 'لما المتجر يفتح هنبدأ بمصر، وبعدها نشوف باقي الدول.',
  },
]
