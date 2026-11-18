"use client"
import Link from "next/link";
import { useState } from "react";

export default function Header(){
const [openModal, setOpenModal]  = useState(false)

    return(
        <header className="header">
        <div className="left_header">
           <Link href="/" className="logo_header">
             EditCore
           </Link>
        </div>

        <div className="right_header">
            <ul className="header_list">
                <li>
                    <Link href="/editor" className="lnk_1">
                    editor
                    </Link>
                </li>

                <li>
                    <Link href="/contact" className="lnk_1">
                    contact
                    </Link>
                </li>

                <li>
                    <Link href="/gallery" className="lnk_1">
                    gallery
                    </Link>
                </li>

                 <li>
                    <Link href="/about" className="lnk_1">
                    about
                    </Link>
                </li>
            </ul>

            <div className="hdr_menu">
                <ul className={`header_lis ${openModal ?'active':''}`}>
                    <li>
                    <Link href="/editor" className="lnk_2">
                    editor
                    </Link>
                </li>

                
                <li>
                    <Link href="/contact" className="lnk_2">
                    contact
                    </Link>
                </li>

                 <li>
                    <Link href="/gallery" className="lnk_2">
                    gallery
                    </Link>
                </li>

                <li>
                    <Link href="/about" className="lnk_2">
                    about
                    </Link>
                </li>

                 <li className="close" onClick={() => setOpenModal(false)}>
                    close
                 </li>
                </ul>

                <button className="menu" onClick={() => setOpenModal(!openModal)}>
                    <div onClick={() => setOpenModal(!openModal)} className="m_itm"></div>
                    <div onClick={() => setOpenModal(!openModal)} className="m_itm"></div>
                    <div onClick={() => setOpenModal(!openModal)} className="m_itm"></div>
                </button>
            </div>
        </div>
        </header>
    )
}