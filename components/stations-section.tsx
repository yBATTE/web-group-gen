"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation } from "lucide-react"
import { STATIONS } from "@/lib/constants"

export default function StationsSection() {
  const [selectedStation, setSelectedStation] = useState<(typeof STATIONS)[0] | null>(null)

  const openDirections = (mapsLink: string) => {
    window.open(mapsLink, "_blank")
  }

  const openMap = (station: (typeof STATIONS)[0]) => {
    setSelectedStation(station)
    const modal = document.getElementById("map-modal")
    if (modal) {
      modal.classList.remove("hidden")
      document.body.style.overflow = "hidden"
    }
  }

  return (
    <section id="estaciones" className="scroll-mt-24 py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-gray-900 dark:text-white mb-6 transition-colors duration-300">
            Conocé Nuestras Estaciones YPF
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
            Encuentra la estación más cercana y descubre todos los servicios que tenemos para ofrecerte
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {STATIONS.map((station) => (
            <Card
              key={station.id}
              className="hover:shadow-lg dark:hover:shadow-2xl transition-shadow duration-300 overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={station.image || "/placeholder.svg"}
                  alt={station.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              <CardContent className="p-6">
                <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white mb-3 transition-colors duration-300">
                  {station.name}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed text-sm transition-colors duration-300">
                  {station.description}
                </p>

                <p className="text-gray-600 dark:text-gray-300 mb-4 flex items-start gap-2 transition-colors duration-300">
                  <MapPin className="h-5 w-5 text-ypf-blue mt-0.5 flex-shrink-0" />
                  {station.address}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {station.services.map((service) => (
                    <Badge
                      key={service}
                      variant="secondary"
                      className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-300"
                    >
                      {service}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDirections(station.mapsLink)}
                    className="flex-1 border-ypf-blue text-ypf-blue hover:bg-ypf-blue hover:text-white dark:border-ypf-blue dark:text-ypf-blue dark:hover:bg-ypf-blue dark:hover:text-white cursor-pointer transition-colors duration-300"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Cómo llegar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => openMap(station)}
                    className="flex-1 bg-ypf-blue hover:bg-ypf-blue-dark text-white cursor-pointer transition-colors duration-300"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Ver en el mapa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pass selected station data to modal */}
      <div
        id="selected-station-data"
        data-station={selectedStation ? JSON.stringify(selectedStation) : ""}
        className="hidden"
      />
    </section>
  )
}
