import Header from '../compnents/Header/Header'
import styles from './gallery.module.css'

export default function Page(){
    return(
        <>
        <section>
            <div className={styles.container}>
               <Header/>
            </div>
        </section>
        </>
    )
}