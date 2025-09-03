"use client"

import { ABOUT_US } from "@/lib/site-data"
import { Target, Eye, Heart } from "lucide-react"

export default function AboutUsSection() {
  return (
    <section
      id="sobre-nosotros"
      className="scroll-mt-24 py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 font-sans">
            {ABOUT_US.title}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-serif">
            {ABOUT_US.subtitle}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {ABOUT_US.stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-ypf-blue mb-2 font-sans">{stat.number}</div>
              <div className="text-gray-600 dark:text-gray-300 font-serif">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-3 gap-12">
          {/* Mission */}
          <div className="text-center">
            <div className="w-16 h-16 bg-ypf-blue rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-sans">
              {ABOUT_US.content.mission.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-serif">
              {ABOUT_US.content.mission.description}
            </p>
          </div>

          {/* Vision */}
          <div className="text-center">
            <div className="w-16 h-16 bg-ypf-blue rounded-full flex items-center justify-center mx-auto mb-6">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-sans">
              {ABOUT_US.content.vision.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-serif">
              {ABOUT_US.content.vision.description}
            </p>
          </div>

          {/* Values */}
          <div className="text-center">
            <div className="w-16 h-16 bg-ypf-blue rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-sans">
              {ABOUT_US.content.values.title}
            </h3>
            <ul className="text-gray-600 dark:text-gray-300 space-y-2 font-serif">
              {ABOUT_US.content.values.items.map((value, index) => (
                <li key={index} className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-ypf-blue rounded-full mr-3 flex-shrink-0"></span>
                  {value}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
