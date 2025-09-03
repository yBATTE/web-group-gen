"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, MessageCircle } from "lucide-react"
import { COMPANY_INFO, CONTACT_MESSAGES } from "@/lib/site-data"

import emailjs from "@emailjs/browser"
import Toastify from "toastify-js"
import "toastify-js/src/toastify.css"

const SERVICE_ID  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID as string
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID as string
const PUBLIC_KEY  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY as string

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toast = (text: string, type: "ok" | "error" = "ok") =>
    Toastify({
      text,
      duration: 3500,
      gravity: "top",
      position: "right",
      close: true,
      stopOnFocus: true,
      style: { background: type === "ok" ? "#16a34a" : "#dc2626", color: "#fff", borderRadius: "10px" },
    }).showToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      toast("Faltan credenciales de EmailJS", "error")
      return
    }

    setIsSubmitting(true)
    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          // Estos nombres deben coincidir con las variables de tu Template en EmailJS
          // (si tu template usa from_name/from_email, renombrá estas keys).
          name: formData.name,
          email: formData.email,
          message: formData.message,
        },
        { publicKey: PUBLIC_KEY }
      )

      setFormData({ name: "", email: "", message: "" })
      toast((CONTACT_MESSAGES?.success as string) || "¡Mensaje enviado con éxito! ✅", "ok")
    } catch (err) {
      console.error(err)
      toast("No se pudo enviar el mensaje ❌", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contacto" className="scroll-mt-24 py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-gray-900 dark:text-white mb-6">
            Contactanos
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            ¿Tenés preguntas? Estamos aquí para ayudarte
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info */}
          <div className="space-y-8">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-ypf-blue rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white mb-2">
                      Dirección
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {COMPANY_INFO.address.street}<br />
                      {COMPANY_INFO.address.postalCode}, {COMPANY_INFO.address.city}<br />
                      {COMPANY_INFO.address.country}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-ypf-blue rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white mb-2">
                      Teléfono
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      <a href={`tel:${COMPANY_INFO.contact.phone}`} className="hover:text-ypf-blue">
                        {COMPANY_INFO.contact.phoneDisplay}
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-ypf-blue rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white mb-2">
                      WhatsApp
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      <a
                        href={`https://wa.me/${COMPANY_INFO.contact.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-ypf-blue"
                      >
                        {COMPANY_INFO.contact.whatsappDisplay}
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-8">
              <h3 className="font-heading font-bold text-2xl text-gray-900 dark:text-white mb-6">
                Envianos un Mensaje
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre *
                  </label>
                  <Input
                    id="name" name="name" type="text" required
                    value={formData.name} onChange={handleChange}
                    className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <Input
                    id="email" name="email" type="email" required
                    value={formData.email} onChange={handleChange}
                    className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mensaje *
                  </label>
                  <Textarea
                    id="message" name="message" required rows={5}
                    value={formData.message} onChange={handleChange}
                    className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    placeholder="Contanos en qué podemos ayudarte..."
                  />
                </div>

                <Button
                  type="submit" disabled={isSubmitting}
                  className="w-full bg-ypf-blue hover:bg-ypf-blue-dark text-white py-3"
                >
                  {isSubmitting ? (CONTACT_MESSAGES?.sending || "Enviando...") : (CONTACT_MESSAGES?.send || "Enviar Mensaje")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
