import Link from 'next/link'
import Header from '../compnents/Header/Header'
import styles from './contact.module.css'

export default function Page(){
    return(
        <>
        <section className={styles.bannerBack}>
             <Header/>
          <div className={styles.container}>

             <div className={styles.bannerContact}>
              <form className={styles.frm} action="#">
                <label>
                    <p className={styles.cn}>Name:</p>
                    <input name='name' type="text" placeholder='Name' className={styles.inp_1}/>
                </label>

                <label>
                    <p className={styles.cn}>Email:</p>
                    <input name='email' type="email" placeholder='Name' className={styles.inp_1} required/>
                </label>

                <label>
                    <select className={styles.op}>
                        <option value="Тема обращения">Тема обращения</option>
                        <option value="Техническая проблема / баг в Editor">Техническая проблема / баг в Editor</option>
                        <option value="Другое">Другое</option>
                    </select>
                </label>

                <label>
                    <textarea className={styles.ar} name="" id="" placeholder='message'></textarea>
                </label>

                <button className={styles.btnContact}>
                   send
                </button>
              </form>
             </div>
          </div>
        </section>

        <section className={styles.bannerBack}>
            <div className={styles.container}>
             <div className={styles.bi}>
                
                <ul className={styles.contact_lit}>
                     <li className={styles.li_itm}>
                      <div className={styles.icn}>
                        <img src="./icons/icn_1.png" alt="" />
                      </div>

                     <a href="https://t.me/R_oot_404" 
                     target="_blank" 
                     rel="noopener 
                     noreferrer" 
                     className={styles.tg}>Telegram</a>
                     </li>
                     
                     <li className={styles.li_itm}>
                      <div className={styles.icn}>
                        <img src="./icons/email.png" alt="" />
                      </div>

                      <a href="mailto:xx505192@gmail.com" className={styles.tg}>
                       xx505192@gmail.com
                         </a>
                     </li>
                </ul>

               
             </div>
            </div>
        </section>
        </>
    )
}