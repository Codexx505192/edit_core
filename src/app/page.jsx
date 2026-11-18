import Image from "next/image";
import styles from "./page.module.css";
import Header from "./compnents/Header/Header";

export default function Home() {
  return (
   <main>
    <section className="banner_back">
        <Header/>
      <div className="container">
        <div className="banner">
          <div className="b_itm">
            <img src="./img/itm.png" alt="" />
          </div>
          

          <div className="banner_bottom">
          <h1 className="txt_1">
            EditCore — быстрый инструмент для редактирования прямо в <br />
            браузере. (Подставь своё: фото, видео, текста).
          </h1>

            <p className="txt_2">
            Никаких сложных установок и перегруженных меню. Открыл, <br />
            отредактировал, скачал результат.
          </p>
          </div>

        </div>
      </div>
    </section>

    <section>
      <div className="container">
        <div className="safety_block">
          
        </div>
      </div>
    </section>
   </main>
  );
}
