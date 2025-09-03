"use client"

import { NEWS } from "@/lib/site-data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"

export default function NewsSection() {
  return (
    <section id="noticias" className="scroll-mt-24 py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-sans">
            Últimas Noticias
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Mantente informado sobre nuestras novedades, promociones y mejoras en nuestras estaciones YPF
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {NEWS.map((article) => (
            <Card
              key={article.id}
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
            >
              <div className="relative">
                <img
                  src={article.image || "/placeholder.svg"}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-blue-600 hover:bg-blue-700">{article.category}</Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  {article.date}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 font-sans">{article.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{article.excerpt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
