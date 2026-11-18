import Header from '../compnents/Header/Header'
import styles from './gallery.module.css'

export default function Page(){
    return(
        <>
        <section>
               <Header/>
            <div className={styles.container}>
            </div>
        </section>
        </>
    )
}