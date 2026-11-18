"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Header(){
  const [openModal, setOpenModal] = useState(false);
  const pathname = usePathname(); // Получаем текущий путь страницы

  const handleLinkClick = () => {
    setOpenModal(false);
  };

  return(
    <header className="header">
      <div className="left_header">
         <Link href="/" className="logo_header">
           EditCore
         </Link>
      </div>

      <div className="right_header">
          {/* Десктопное меню */}
          <ul className="header_list">
              <li>
                  <Link href="/" className={`lnk_1 ${pathname === '/' ? 'active' : ''}`}>
                    home
                  </Link>
              </li>
              <li>
                  <Link href="/editor" className={`lnk_1 ${pathname === '/editor' ? 'active' : ''}`}>
                    editor
                  </Link>
              </li>
              <li>
                  <Link href="/contact" className={`lnk_1 ${pathname === '/contact' ? 'active' : ''}`}>
                    contact
                  </Link>
              </li>
              <li>
                  <Link href="/gallery" className={`lnk_1 ${pathname === '/gallery' ? 'active' : ''}`}>
                    gallery
                  </Link>
              </li>
              <li>
                  <Link href="/about" className={`lnk_1 ${pathname === '/about' ? 'active' : ''}`}>
                    about
                  </Link>
              </li>
          </ul>

          <div className="hdr_menu">
              {/* Мобильное меню */}
              <ul className={`header_lis ${openModal ? 'active' : ''}`}>
                  <li>
                      <Link href="/" className={`lnk_2 ${pathname === '/' ? 'active' : ''}`} onClick={handleLinkClick}>
                        home
                      </Link>
                  </li>
                  <li>
                      <Link href="/editor" className={`lnk_2 ${pathname === '/editor' ? 'active' : ''}`} onClick={handleLinkClick}>
                        editor
                      </Link>
                  </li>
                  <li>
                      <Link href="/contact" className={`lnk_2 ${pathname === '/contact' ? 'active' : ''}`} onClick={handleLinkClick}>
                        contact
                      </Link>
                  </li>
                  <li>
                      <Link href="/gallery" className={`lnk_2 ${pathname === '/gallery' ? 'active' : ''}`} onClick={handleLinkClick}>
                        gallery
                      </Link>
                  </li>
                  <li>
                      <Link href="/about" className={`lnk_2 ${pathname === '/about' ? 'active' : ''}`} onClick={handleLinkClick}>
                        about
                      </Link>
                  </li>
                  <li className="close" onClick={() => setOpenModal(false)}>
                     close
                  </li>
              </ul>

              {/* Кнопка бургера */}
              <button 
                type="button" 
                className={`menu ${openModal ? 'open' : ''}`} 
                onClick={() => setOpenModal(prev => !prev)}
              >
                  <div className="m_itm"></div>
                  <div className="m_itm"></div>
                  <div className="m_itm"></div>
              </button>
          </div>
      </div>
    </header>
  );
}