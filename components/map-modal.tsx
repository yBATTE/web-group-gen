"use client"

import { useEffect, useState } from "react"
import { X, ExternalLink, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MapModal() {
  const [selectedStation, setSelectedStation] = useState<any>(null)

  useEffect(() => {
    const checkForStationData = () => {
      const dataElement = document.getElementById("selected-station-data")
      if (dataElement) {
        const stationData = dataElement.getAttribute("data-station")
        if (stationData) {
          try {
            const station = JSON.parse(stationData)
            setSelectedStation(station)
          } catch (e) {
            console.error("Error parsing station data:", e)
          }
        }
      }
    }

    // Check for station data periodically
    const interval = setInterval(checkForStationData, 100)

    return () => clearInterval(interval)
  }, [])

  const closeModal = () => {
    const modal = document.getElementById("map-modal")
    if (modal) {
      modal.classList.add("hidden")
      document.body.style.overflow = "auto"
    }
    setSelectedStation(null)
  }

  const generateMapUrl = (station: any) => {
    if (station?.lat && station?.lng) {
      return `https://maps.google.com/maps?q=${station.lat},${station.lng}&hl=es&z=16&output=embed`
    }
    // Fallback to a default Buenos Aires location
    return "https://maps.google.com/maps?q=-34.6037,-58.3816&hl=es&z=12&output=embed"
  }

  const openInGoogleMaps = () => {
    if (selectedStation?.lat && selectedStation?.lng) {
      const url = `https://www.google.com/maps?q=${selectedStation.lat},${selectedStation.lng}`
      window.open(url, "_blank")
    }
  }

  return (
    <div
      id="map-modal"
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 hidden"
      onClick={closeModal}
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="font-heading font-bold text-xl text-gray-900">
            {selectedStation ? selectedStation.name : "Mapa de la Estación"}
          </h3>
          <Button variant="ghost" size="icon" onClick={closeModal} className="hover:bg-gray-100 cursor-pointer">
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="p-6">
          {selectedStation && (
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-5 w-5 text-ypf-blue" />
                  <p className="text-gray-600">{selectedStation.address}</p>
                </div>
                <p className="text-sm text-gray-500">
                  Coordenadas: {selectedStation.lat}, {selectedStation.lng}
                </p>
              </div>
              <Button
                onClick={openInGoogleMaps}
                className="bg-ypf-blue hover:bg-blue-700 text-white cursor-pointer"
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir en Maps
              </Button>
            </div>
          )}

          <div className="aspect-video w-full">
            <iframe
              src={generateMapUrl(selectedStation)}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={selectedStation ? `Mapa de ${selectedStation.name}` : "Mapa de la estación"}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
