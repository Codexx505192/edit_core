import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
<link href="https://fonts.googleapis.com/css2?family=Shantell+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet"></link>

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "EditCore — Онлайн веб-фоторедактор",
  description: "Полнофункциональный веб-редактор изображений. Рисование, кисти, ластик, пипетка, цветокоррекция, работа с прозрачностью и экспорт спрайтов прямо в браузере.",
  keywords: ["фоторедактор", "веб-фотошоп",  "редактор картинок"],
  authors: [{ name: "Ваше Имя" }],
  openGraph: {
    title: "EditCore — Онлайн веб-фоторедактор",
    description: "Создавайте и редактируйте графику, рисуйте спрайты для игр и настраивайте фильтры прямо в браузере.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
