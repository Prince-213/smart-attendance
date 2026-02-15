"use client";

import React, { useState } from "react";
import { Lineicons } from "@lineiconshq/react-lineicons";
import {
  Home2Outlined,
  GraduationCap1Outlined,
  User4Outlined,
  PlayOutlined,
  CodegeexOutlined,
} from "@lineiconshq/free-icons";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <section className="pb-32 md:pb-44 bg-[url('/images/bg-with-grid.png')] bg-cover bg-center bg-no-repeat text-slate-800 text-sm">
      <nav className="flex items-center justify-between p-4 md:px-16 lg:px-24 xl:px-32 border-b border-white/25 w-full">
        <a
          href="https://prebuiltui.com"
          className=" pt-3 px-3 flex items-center space-x-1.5"
        >
          <Lineicons
            icon={CodegeexOutlined}
            size={32}
            color="blue"
            strokeWidth={1.5}
          />
          <h1 className=" font-bold text-xl">Attendly</h1>
        </a>

        <ul
          id="menu"
          className={`max-md:absolute max-md:h-full max-md:z-50 max-md:w-full max-md:top-0 max-md:backdrop-blur max-md:bg-white/70 max-md:text-base flex flex-col md:flex-row items-center justify-center gap-8 font-medium transition-all duration-300 ${
            isMenuOpen ? "max-md:left-0" : "max-md:-left-full"
          }`}
        >
          <li onClick={closeMenu} className="hover:text-slate-500">
            <a href="#">Home</a>
          </li>
          <li onClick={closeMenu} className="hover:text-slate-500">
            <a href="#">Products</a>
          </li>
          <li onClick={closeMenu} className="hover:text-slate-500">
            <a href="#">Stories</a>
          </li>
          <li onClick={closeMenu} className="hover:text-slate-500">
            <a href="#">Pricing</a>
          </li>
          <li onClick={closeMenu} className="hover:text-slate-500">
            <a href="#">Docs</a>
          </li>

          <button
            id="close-menu"
            onClick={closeMenu}
            className="md:hidden bg-gray-800 hover:bg-black text-white p-2 rounded-md aspect-square font-medium transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </ul>

        <button id="open-menu" onClick={toggleMenu} className="md:hidden">
          <svg
            className="size-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link
          href={"/login"}
          className="max-md:hidden text-base flex items-center space-x-2 font-semibold px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 transition rounded-md"
        >
          <Lineicons
            icon={User4Outlined}
            size={24}
            color="white"
            strokeWidth={1.5}
          />
          <span>Log in</span>
        </Link>
      </nav>

      <div className="flex flex-col-reverse gap-10 md:flex-row px-4 md:px-16 lg:px-24 xl:px-32 mt-12 md:mt-32">
        <div className="max-md:text-center lg:max-w-[55%]">
          <h5 className="text-4xl text-balance md:text-8xl md:leading-[96px] font-semibold lg:max-w-[85%] bg-gradient-to-r from-slate-900 to-[#6D8FE4] text-transparent bg-clip-text">
            Automate Your Attendance Record Collection
          </h5>

          <p className="text-sm md:text-base max-w-lg mt-6 max-md:px-2 text-slate-600">
            Experience a world-class attendance management system that saves
            time, eliminates paper trails, and provides real-time insights into
            student presence for academic institutions.
          </p>

          <div className=" w-full justify-center lg:justify-start pt-6 flex items-center">
            <Link
              href={"/attend"}
              className="px-5 py-3 rounded-md font-semibold bg-white text-indigo-600 border border-indigo-400 flex items-center gap-2 hover:bg-indigo-600/5 active:scale-95 transition-all"
              type="button"
            >
              <Lineicons
                icon={PlayOutlined}
                size={24}
                color="blue"
                strokeWidth={1.5}
              />
              <span>Attend Class</span>
            </Link>
          </div>
          {/* <div className="flex items-center gap-4 mt-6 max-md:justify-center">
            <button
              className="px-8 py-3 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95 transition-all"
              type="button"
            >
              Get Started
            </button>
            <button
              className="px-5 py-3 rounded-md bg-white text-indigo-600 border border-indigo-400 flex items-center gap-2 hover:bg-indigo-600/5 active:scale-95 transition-all"
              type="button"
            >
              <Lineicons
                icon={Home2Outlined}
                size={24}
                color="blue"
                strokeWidth={1.5}
              />
              <span>Our courses</span>
            </button>
          </div> */}
          <div className="flex flex-col lg:flex-row items-center mt-9 max-md:justify-center">
            <div className="flex -space-x-3.5 pr-3">
              <Image
                width={250}
                height={250}
                src="/images/cx-insight-YloghyfD7e8-unsplash.jpg"
                alt="image"
                className="size-24 lg:size-30 border-2 border-white rounded-full hover:-translate-y-px transition z-1 object-center object-cover bg-center bg-cover"
              />

              <Image
                width={250}
                height={250}
                src="/images/douglas-lopez-WFItslWB89M-unsplash.jpg"
                alt="image"
                className=" size-24 lg:size-30 border-2 border-white rounded-full hover:-translate-y-px transition z-[3] object-center object-cover bg-center bg-cover"
              />
              <Image
                width={250}
                height={250}
                src="/images/juli-kosolapova-7hxOWrk-8RI-unsplash.jpg"
                alt="image"
                className="size-24 lg:size-30 border-2 border-white rounded-full hover:-translate-y-px transition z-[4] object-center object-cover bg-center bg-cover"
              />
              <Image
                width={250}
                height={250}
                src="/images/miguel-henriques--8atMWER8bI-unsplash.jpg"
                alt="image"
                className="size-24 lg:size-30 border-2 border-white rounded-full hover:-translate-y-px transition z-[4] object-center object-cover bg-center bg-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-px">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    width="23"
                    height="22"
                    viewBox="0 0 13 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.85536 0.463527C6.00504 0.00287118 6.65674 0.00287028 6.80642 0.463526L7.82681 3.60397C7.89375 3.80998 8.08572 3.94946 8.30234 3.94946H11.6044C12.0888 3.94946 12.2901 4.56926 11.8983 4.85397L9.22687 6.79486C9.05162 6.92219 8.97829 7.14787 9.04523 7.35388L10.0656 10.4943C10.2153 10.955 9.68806 11.338 9.2962 11.0533L6.62478 9.11244C6.44954 8.98512 6.21224 8.98512 6.037 9.11244L3.36558 11.0533C2.97372 11.338 2.44648 10.955 2.59616 10.4943L3.61655 7.35388C3.68349 7.14787 3.61016 6.92219 3.43491 6.79486L0.763497 4.85397C0.37164 4.56927 0.573027 3.94946 1.05739 3.94946H4.35944C4.57606 3.94946 4.76803 3.80998 4.83497 3.60397L5.85536 0.463527Z"
                      fill="#FF8F20"
                    />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-slate-500">Used by 1,000+ people</p>
            </div>
          </div>
        </div>
        <div className=" lg:-translate-x-20  lg:w-[60%]">
          <img
            className="w-full h-auto"
            src="/images/users-group.png"
            alt="Users group"
          />
        </div>
      </div>
    </section>
  );
}
