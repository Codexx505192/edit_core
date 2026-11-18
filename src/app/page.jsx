import Image from "next/image";
import styles from "./page.module.css";
import Header from "./compnents/Header/Header";

export default function Home() {
  return (
   <main>
    <section>
        <Header/>
      <div className="container">
        <div className="banner">
          <div className="b_itm">
            <img src="./img/itm.png" alt="" />
          </div>
          
        </div>
      </div>
    </section>
   </main>
  );
}
