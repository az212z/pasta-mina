# DESIGN-QUALITY-REPORT — باستا مينا · Pasta Mina

موقع تعريفي فاخر (Arabic RTL، vanilla static) لمطعم إيطالي للباستا والبيتزا — حي المونسية، الرياض.

---

## 1) المهارات المُستدعاة وكيف طُبّقت

| المهارة | كيف استُخدمت |
|---|---|
| **ui-ux-pro-max** | شُغّل `search.py "italian pasta trattoria warm elegant" --design-system`. المخرج الآلي اقترح نظام "Liquid Glass / وردي / Fredoka" وهو لا يناسب بريف "warm elegant trattoria". اتُّخذ قرار تصميمي واعٍ بتجاوزه والالتزام بلوحة البريف الصريحة (كريمي/طماطمي/أوليف/فحمي/ذهب) وخطّي El Messiri + Tajawal. طُبّقت قوائم التحقّق (تباين 4.5:1، أيقونات SVG لا emoji، focus-visible، responsive 375/768/1024/1440، prefers-reduced-motion). |
| **design-taste-frontend** | Design Read معلن: «صفحة هبوط لمطعم تراتوريا، جمهور زوّار، لغة إيطالية تحريرية دافئة». الدايلز: VARIANCE 7 / MOTION 6 / DENSITY 4. تجنّب الـ AI tells: لا بنفسجي AI، لا 3 كروت متطابقة عمياء (شبكة بإيقاع مختلف + hero split غير متمركز)، لا em-dash، صور حقيقية لا fake screenshots، accent واحد مقفول، نظام زوايا واحد. |
| **emil-design-eng** | منحنيات easing مخصّصة (`cubic-bezier(.23,1,.32,1)` / `(.16,1,.3,1)`)، scale(.97) على الضغط، عدم البدء من scale(0) (الزينة تبدأ من .6/.9)، مدد قصيرة للميكرو (150–250ms)، الموشن التوقيعي يلعب مرة عند الدخول ثم يهدأ، fallback كامل للحركة. |
| **high-end-visual-design** | إحساس فاخر: ظلال ملوّنة (مائلة للبنّي لا أسود نقي)، حواف ناعمة كبيرة (squircle radii)، طبقة صورة دائرية داخل إطار «طبق» بحواف متّسقة، مسافات كبيرة (`py` ~6.5rem)، خطوط عريضة، CTA sheen، nav زجاجي عائم عند التمرير. |

## 2) مخرجات design-system المعتمدة (بعد التجاوز الواعي)

- **Palette (CSS vars):** `--cream #f7efe1` خلفية · `--paper #fbf6ec` كروت · `--ink #2a211b` نص · `--tomato #c0392b` العلامة · `--olive #4f6043` accent ثانوي · `--gold #b8862f` لمسة فاخرة · `--line #ddccaf` hairlines.
- **Typography:** display **El Messiri** (600/700) · body **Tajawal** (400/500/700)، عبر preconnect + `display=swap`. سلّم: 13/15/16/18/22/28/36 + clamp للهيرو والـ h2.
- **Effects:** زوايا 18/26px، ظلال tinted، تحوّلات transform/opacity فقط، نظام مسافات 4/8.

لماذا هذه الألوان/الخطوط؟ التراتوريا الإيطالية الدافئة تتطلّب كريمًا وطماطميًا وأوليفًا (لون الزيتون/الريحان) مع فحمي للرقي ولمسة ذهب — وهذا يطابق صور المطعم (طوب، خشب، أخضر، فرن). El Messiri يمنح العناوين طابعًا أنيقًا غير كرتوني، وTajawal نظيف للنصوص.

## 3) ⭐ الموشن التوقيعي — لفّة الباستا (Pasta Twirl)

المشهد في الهيرو مبني من طبقات absolutely-positioned داخل `.stage`:

1. **خيوط المعكرونة تُلَفّ على الشوكة:** ثلاثة `path.strand` لها `getTotalLength()` تُضبط `stroke-dasharray = len` و`stroke-dashoffset = len` (مخفية)، ثم تنتقل إلى `offset = 0` بمدة 1.15s و easing `cubic-bezier(.16,1,.3,1)` بتدرّج (stagger 180ms) — فتبدو وكأنها تلتفّ صعودًا على أسنان الشوكة.
2. **الشوكة تلفّ (twirl):** `g.fork-group` بـ `transform-origin: 50% 92%` يُشغّل عبر WAAPI `animate()` تتابع زوايا `0 → -14° → 12° → -6° → 0` خلال 2.6s ease-in-out fill:forwards — حركة لفّ واقعية تهدأ.
3. **بخار يتصاعد:** ثلاثة `path.steam` تُرسم بـ `stroke-dashoffset` وتصعد مع `translateY` سالب وتلاشي opacity، حلقة لطيفة (4.2s) بتأخير متدرّج.
4. **ريحان + طماطم كرزية:** عنصرا `.garnish` على «الطبق» يظهران بـ pop (scale .6→1)، وثلاث `.drift` ورقات/طماطم تتساقط بنعومة مع دوران خفيف (حلقة once-style لطيفة).

عدد المجموعات المتحرّكة المتزامنة ≤ 3 (خيوط، شوكة، بخار/garnish)، وكلها transform/opacity/stroke-dashoffset → 60fps.

**fallback (prefers-reduced-motion):** يكتشفها JS مبكرًا؛ ترسم الخيوط كاملة (offset=0)، تُظهر الريحان والطماطم، وبخارًا خفيفًا ثابتًا — أي **الطبق النهائي مركّبًا بلا حركة**. الشوكة ثابتة. تُلغى ken-burns عبر media query في CSS.

**polish إضافي:** ken-burns على صورة الهيرو الحقيقية (`pm-4.jpg`)، scroll-reveal للكروت والأقسام عبر IntersectionObserver (+fallback يُظهر كل شيء)، hover zoom على كروت الأطباق والمعرض، sticky nav يتقلّص (`.scrolled`)، CTA sheen.

## 4) قرارات UX/UI الأساسية

- **Hero split غير متمركز** (نص + مسرح الموشن)، يتحوّل لعمود واحد مع المسرح أولًا على الجوال.
- **قائمة جوال ملء الشاشة:** overlay بـ `100vw/100dvh` خلفية فحمية صلبة، زر X واضح، روابط بكشف متدرّج، خلفية scroll مقفولة، Esc يغلق، إدارة focus.
- **نموذج الحجز/الطلب:** select لنوع الطلب + الاسم/الجوال (مطلوبان) + الضيوف/التاريخ/الوقت/ملاحظات → يبني رسالة عربية ويفتح `wa.me/966554580943` + يحفظ في localStorage + toast نجاح (aria-live). موسوم بوضوح كنموذج تجريبي.
- **FABs عائمة:** واتساب + اتصال + خريطة (أهداف ≥ 44px).
- **Lightbox-lite** للمعرض (لوحة مفاتيح + Esc + إغلاق بالخلفية).

## 5) Accessibility

- `<html lang="ar" dir="rtl">`، HTML سيمانتيك (header/nav/main/section/footer)، تدرّج عناوين h1→h2→h3.
- تباين: نص فحمي `#2a211b` على كريمي `#f7efe1` ≈ 12:1؛ كريمي على فحمي (trust/reserve/footer) عالٍ؛ أبيض على طماطمي `#c0392b` ≈ 4.7:1 (أزرار). كلها ≥ 4.5:1.
- `:focus-visible` بـ outline أوليف 3px على كل عنصر تفاعلي.
- كل `<img>` لها alt عربي وصفي + width/height (منع CLS) + lazy/decoding لغير الهيرو، والهيرو `fetchpriority="high"`.
- كل زر أيقونة له `aria-label`؛ أيقونات SVG inline (لا emoji كأيقونات بنية).
- `prefers-reduced-motion` يُعطّل الموشن التوقيعي وken-burns والـ reveal.

## 6) النصوص (محايدة جندريًا)

«احجز طاولة»، «اطلب الآن»، «استعرض القائمة»، «تواصل» — لا «احجزي/اطلبي/لكِ». لا أسعار مخترعة: كل بطاقة طبق تقول «السعر حسب القائمة». التقييم 4.6 (235) من خرائط قوقل فقط، مذكور في الهيرو وشريط الثقة وJSON-LD.

## 7) Performance

- vanilla فقط، لا مكتبات. خطوط preconnect + swap. صور بأبعاد ثابتة.
- حركة transform/opacity/stroke-dashoffset؛ `backdrop-filter` على nav الثابت فقط.
- JS مؤجّل (`defer`)، محروس (يتحقّق من وجود كل عنصر)، لا يخفي محتوى عند الخطأ.

## 8) اختبار الذوق (Taste / Impeccable)

يبدو فاخرًا وإيطاليًا دافئًا، سعوديًا مناسبًا، يُقنع خلال 3 ثوانٍ بفضل لفّة الباستا والصورة الحقيقية، لا يشبه قالبًا مجانيًا (مسرح موشن مخصّص + إيقاع أقسام متنوّع + لوحة وخطوط متّسقة). ✔
