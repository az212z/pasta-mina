# باستا مينا · Pasta Mina

موقع تعريفي فاخر (Arabic RTL) لمطعم إيطالي للباستا والبيتزا في حي المونسية بالرياض. مبني بـ HTML/CSS/JS فقط (vanilla، بدون خطوة بناء) وجاهز للنشر على GitHub Pages.

## الرابط الحي
- https://az212z.github.io/pasta-mina/ (بعد النشر على GitHub Pages من الفرع `main`، مجلد الجذر)

## حالة الـ Backend
لا يوجد backend. نموذج الحجز/الطلب **تجريبي**:
- يحفظ البيانات محليًا في المتصفح (`localStorage` تحت المفتاح `pastaMinaReservations`).
- يُجهّز رسالة عربية مُعبّأة ويفتح `wa.me/966554580943` للتأكيد اليدوي.
- لا يوجد نظام حجز آلي أو قاعدة بيانات.

## الموشن التوقيعي
لفّة الباستا (Pasta Twirl) في الهيرو: شوكة SVG تدور وتلفّ خيوط المعكرونة على أسنانها (عبر `stroke-dashoffset` + دوران)، مع بخار يتصاعد وريحان/طماطم كرزية تتساقط بنعومة. يتوقف بالكامل مع `prefers-reduced-motion` ويُظهر الطبق النهائي ثابتًا. التفاصيل في `DESIGN-QUALITY-REPORT.md`.

## مصدر الصور
صور حقيقية من ملف المطعم على خرائط قوقل (11 صورة). بعد التنقية (CURATE) أُبقيت 8 صور نظيفة في `assets/img/`، ونُقلت 3 صور إلى `assets/_excluded/`:
- `pm-2.jpg` و`pm-10.jpg`: لوحات قوائم/أسعار (غير مناسبة).
- `pm-11.jpg`: واجهة تحمل اسم نشاط آخر (Casapasta).

## البنية
```
index.html · 404.html · favicon.svg · .nojekyll
assets/css/style.css · assets/js/main.js · assets/img/*
tests/site.spec.ts · playwright.config.ts
README.md · sales-message.md · DESIGN-QUALITY-REPORT.md
```

## التشغيل محليًا
```bash
npx http-server -p 4173 -c-1 .
# ثم افتح http://localhost:4173
```

## الاختبارات
```bash
npm i -D @playwright/test http-server
npx playwright install
npx playwright test
```
تغطي: RTL والعنوان، الهيرو وأزرار الـ CTA، التقييم الحقيقي 4.6، عدم وجود أسعار مخترعة، قائمة الجوال ملء الشاشة، نموذج الواتساب والـ toast، أزرار FAB، عدم وجود تمرير أفقي عند 390px، نصوص alt لكل صورة، وبيانات JSON-LD.

## ملاحظات
- ألوان: كريمي + أحمر طماطمي + أوليف/سيج + فحمي + لمسة ذهب.
- خطوط: El Messiri (عناوين) + Tajawal (نصوص) عبر Google Fonts مع `display=swap`.
- نصوص محايدة جندريًا (احجز/اطلب/تواصل). تقييم قوقل حقيقي فقط، بلا أسعار مخترعة.
