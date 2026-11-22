import Header from '../compnents/Header/Header'
import styles from './gallery.module.css'

export default function Page(){
    return(
        <>
        <section>
               <Header/>
            <div className={styles.container}>
                <div className={styles.gallery_block}>
                   <p className={styles.gallery_txt_1}>
                    как пользоваться программой
                   </p>

                  <div className={styles.gallery_info}>
                     <p className={styles.gallery_txt_2}>
                        1. Верхняя панель — файлы, история, масштаб и экспорт
                     </p>

                     <ul className={styles.gallery_list}>
                    <li className={styles.gallery_list_itm}>
                        <b className={styles.b}>
                            Открыть фото:
                        </b> 
                        загружает картинку с компьютера или телефона на
                         <b className={styles.b}>
                            активный слой 
                        </b> 
                        <br />
                        и подстраивает размер холста под неё (в пределах 16–2048 px). Тот же <br />
                        файл можно выбрать повторно.
                    </li>

                     <li className={styles.gallery_list_itm}>
                        <b className={styles.b}>
                             Назад / Вперёд:
                        </b> 
                        откат и возврат действий по всей истории слоёв (Ctrl+Z / <br />
                        Cmd+Z и Ctrl+Y / Cmd+Shift+Z).
                    </li>

                    <li className={styles.gallery_list_itm}>
                        <b className={styles.b}>
                             Зум (−, 75%, +):
                        </b> 
                        Кнопки − и + меняют масштаб от 25% до 1600%. <br />
                        Клик по процентам (75%) сбрасывает масштаб обратно на стартовые 75%. <br />
                        При зуме выше 100% включается чёткая пиксельная отрисовка (pixelated), <br />
                        удобная для спрайтов.
                    </li>

                    
                    <li className={styles.gallery_list_itm}>
                        <b className={styles.b}>
                            Очистить слой:
                        </b> 
                       полностью очищает текущий активный слой (если выбран <br />
                       самый нижний слой и включён белый фон — заливает его белым).
                    </li>

                     <li className={styles.gallery_list_itm}>
                        <b className={styles.b}>
                           Сохранить PNG:
                        </b> 
                       объединяет все видимые слои с учётом текущих фильтров <br />
                       цветокоррекции и скачивает готовый файл.
                    </li>
                   </ul>
                  </div>

                   <div className={styles.gallery_info}>
                     <p className={styles.gallery_txt_2}>
                       2. Левая панель — инструменты, холст, сетка и трансформация
                     </p>

                     <p className={styles.gallery_txt_3}>Инструменты</p>

                     <ul className={styles.gallery_list}>
                    <li className={styles.gallery_list_itm}>
                      <b className={styles.b}>Кисть:</b> свободное рисование выбранным цветом на активном слое.
                    </li>

                    <li className={styles.gallery_list_itm}>
                      <b className={styles.b}>Ластик:</b> стирает на активном слое. На нижнем слое при включённом белом <br />
                      фоне стирает в белый цвет, на остальных (или при выключенном белом фоне) — в <br />
                      прозрачность.
                    </li>

                      <li className={styles.gallery_list_itm}>
                      <b className={styles.b}>Пипетка:</b> берёт цвет под курсором с видимого холста и автоматически<br />
                      переключает инструмент обратно на Кисть.
                    </li>

                    <li className={styles.gallery_list_itm}>
                      <b className={styles.b}>Прямоугольник / Круг:</b> зажми кнопку мыши или палец и потяни. Во время <br />
                      движения виден предпросмотр; при отпускании фигура фиксируется. Если <br />
                      отмечено «Заливать фигуру», фигура рисуется сплошной заливкой, иначе — <br />
                      только контуром.
                    </li>

                    <li className={styles.gallery_list_itm}>
                      <b className={styles.b}>Текст (клик):</b> введи текст в появившееся поле и кликни в нужном месте холста. <br />
                      Размер шрифта зависит от ползунка размера (size * 4, минимум 10px).
                    </li>
                   </ul>
                  </div>

                   <div className={styles.gallery_info}>
                     <p className={styles.gallery_txt_2}>
                        Размер холста и сетка
                     </p>

                     <p className={styles.gallery_txt_3}>Инструменты</p>

                     <ul className={styles.gallery_list}>
                    <li className={styles.gallery_list_itm}>
                      <b className={styles.b}>Ширина × Высота:</b> введи числа вручную (от 16 до 2048) или нажми быстрый <br />
                      пресет 32×32, 64×64, 512×512, затем нажми «📐 Изменить размер» — <br />
                      содержимое слоёв сохранится.
                    </li>

                    <li className={styles.gallery_list_itm}>
                      <b className={styles.b}>Белый фон (слой 1):</b> при включении подкладывает белый фон под нижний слой
                    </li>

                    <li className={styles.gallery_list_itm}>
                      <b className={styles.b}>Показать сетку:</b> включает поверх холста сетку с шагом 8×8, 16×16, 32×32 или <br />
                      64×64 px. Сетка нужна только для удобства и не попадает в PNG.
                    </li>
                     
                   </ul>
                  </div>

                  <div className={styles.gallery_info}>
                     <p className={styles.gallery_txt_2}>
                        Цвет, размер и трансформация
                     </p>

                     <ul className={styles.gallery_list}>
                    <li className={styles.gallery_list_itm}>
                      <b className={styles.b}>Цвет:</b> выбор цвета в палитре.
                    </li>

                    <li className={styles.gallery_list_itm}>
                      <b className={styles.b}>Размер:</b> если выбран Ластик, ползунок меняет размер ластика (1–100px); для <br />
                      остальных инструментов — размер кисти/фигур/текста (1–50px).
                    </li>

                    <li className={styles.gallery_list_itm}>
                      <b className={styles.b}>Повернуть 90°:</b> поворачивает все слои и сам холст на 90° по часовой стрелке. 
                      остальных инструментов — размер кисти/фигур/текста (1–50px).
                    </li>

                    <li className={styles.gallery_list_itm}>
                      <b className={styles.b}>Отразить:</b> зеркально отражает все слои по горизонтали.
                    </li>
                   </ul>
                  </div>

                  <div className={styles.gallery_c}>
                   
                  </div>
                </div>
            </div>
        </section>
        </>
    )
}