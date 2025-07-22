"use client"

import { useState, useEffect } from "react"
import { Droplets, Eye, Wind, Cloud, Sun, CloudRain, MapPin, Calendar, TrendingUp, LocateFixed } from "lucide-react"

interface WeatherData {
  dt: number
  main: {
    temp: number
    feels_like: number
    humidity: number
  }
  weather: {
    main: string
    description: string
    icon: string
  }[]
  wind: {
    speed: number
  }
  visibility: number
  name?: string
}

export default function ModernWeatherApp() {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<WeatherData[]>([])
  const [historicalData, setHistoricalData] = useState<WeatherData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDateIndex, setSelectedDateIndex] = useState([0])
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [locationName, setLocationName] = useState("Detecting location...")
  const [locationPermission, setLocationPermission] = useState<"granted" | "denied" | "prompt">("prompt")

  const API_KEY = "ee8448d0c5ed883e08fbfe91dc6c9ffc"

  // Detect user's location
  useEffect(() => {
    const detectLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lon: position.coords.longitude
            })
            setLocationPermission("granted")
          },
          (error) => {
            console.error("Geolocation error:", error)
            setLocationPermission("denied")
            // Default to India coordinates if location access is denied
            setLocation({ lat: 20.5937, lon: 78.9629 })
            setLocationName("India")
          }
        )
      } else {
        // Default to India coordinates if geolocation is not supported
        setLocation({ lat: 20.5937, lon: 78.9629 })
        setLocationName("India")
      }
    }

    detectLocation()
  }, [])

  // Fetch weather data when location changes
  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!location) return

      try {
        setLoading(true)
        setError(null)

        // Current weather
        const currentRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}&units=metric`,
        )
        const currentData = await currentRes.json()
        setCurrentWeather(currentData)
        setLocationName(currentData.name || "Your Location")

        // Forecast (5 days)
        const forecastRes = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}&units=metric`,
        )
        const forecastData = await forecastRes.json()
        setForecast(forecastData.list)

        // Mock historical data
        const mockHistorical = Array.from({ length: 5 }, (_, i) => ({
          dt: Math.floor((Date.now() - (i + 1) * 24 * 60 * 60 * 1000) / 1000),
          main: {
            temp: currentData.main.temp + (Math.random() - 0.5) * 10,
            feels_like: currentData.main.feels_like + (Math.random() - 0.5) * 10,
            humidity: Math.floor(Math.random() * 40) + 40,
          },
          weather: [
            {
              main: currentData.weather[0].main,
              description: currentData.weather[0].description,
              icon: currentData.weather[0].icon,
            },
          ],
          wind: {
            speed: Math.random() * 10,
          },
          visibility: Math.floor(Math.random() * 5000) + 5000,
        }))
        setHistoricalData(mockHistorical)

        setLoading(false)
      } catch (err) {
        setError("Failed to fetch weather data. Please try again.")
        setLoading(false)
        console.error(err)
      }
    }

    fetchWeatherData()
  }, [location])

  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
  }

  const getWeatherIconComponent = (main: string) => {
    switch (main.toLowerCase()) {
      case "clear":
        return <Sun className="w-8 h-8 text-yellow-500" />
      case "clouds":
        return <Cloud className="w-8 h-8 text-gray-500" />
      case "rain":
        return <CloudRain className="w-8 h-8 text-blue-500" />
      default:
        return <Cloud className="w-8 h-8 text-gray-500" />
    }
  }

  const refreshLocation = () => {
    setLoading(true)
    setLocation(null)
    setLocationName("Detecting location...")
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
        },
        (error) => {
          console.error("Geolocation error:", error)
          setLocation({ lat: 20.5937, lon: 78.9629 })
          setLocationName("India")
        }
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-2 text-2xl font-bold text-gray-800">
            <MapPin className="w-6 h-6 text-blue-600" />
            <span>{locationName}</span>
          </div>
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-64 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-64 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-48 w-full bg-gray-200 rounded animate-pulse"></div>
          <div className="h-32 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="max-w-md p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
          <button 
            onClick={refreshLocation}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-2xl font-bold text-gray-800">
            <MapPin className="w-6 h-6 text-blue-600" />
            <span>{locationName}</span>
          </div>
          <button 
            onClick={refreshLocation}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50"
          >
            <LocateFixed className="w-5 h-5 text-blue-600" />
            <span>Refresh Location</span>
          </button>
        </div>

        {/* Current Weather & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Weather Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-lg border-0 shadow">
            <div className="p-8">
              {currentWeather && (
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <img
                        src={getWeatherIcon(currentWeather.weather[0].icon) || "/placeholder.svg"}
                        alt={currentWeather.weather[0].description}
                        className="w-20 h-20"
                      />
                      <div>
                        <div className="text-5xl font-bold">{Math.round(currentWeather.main.temp)}°C</div>
                        <div className="text-blue-100 capitalize text-lg">{currentWeather.weather[0].description}</div>
                      </div>
                    </div>
                    <div className="text-blue-100">Feels like {Math.round(currentWeather.main.feels_like)}°C</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Weather Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Weather Details</h2>
            </div>
            <div className="space-y-4">
              {currentWeather && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Humidity</span>
                    </div>
                    <span className="px-3 py-1 text-sm bg-gray-100 rounded-full">{currentWeather.main.humidity}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Wind Speed</span>
                    </div>
                    <span className="px-3 py-1 text-sm bg-gray-100 rounded-full">{currentWeather.wind.speed} m/s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Visibility</span>
                    </div>
                    <span className="px-3 py-1 text-sm bg-gray-100 rounded-full">{(currentWeather.visibility / 1000).toFixed(1)} km</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Historical Data */}
        {historicalData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Historical Weather Data</h2>
            </div>
            <div className="space-y-6">
              <div className="px-2">
                <input
                  type="range"
                  min="0"
                  max={historicalData.length - 1}
                  value={selectedDateIndex[0]}
                  onChange={(e) => setSelectedDateIndex([parseInt(e.target.value)])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>5 days ago</span>
                  <span>Yesterday</span>
                </div>
              </div>

              {historicalData[selectedDateIndex[0]] && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getWeatherIconComponent(historicalData[selectedDateIndex[0]].weather[0].main)}
                      <div>
                        <div className="font-semibold">
                          {new Date(historicalData[selectedDateIndex[0]].dt * 1000).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-sm text-gray-600">
                          {historicalData[selectedDateIndex[0]].weather[0].description}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {Math.round(historicalData[selectedDateIndex[0]].main.temp)}°C
                      </div>
                      <div className="text-sm text-gray-600">
                        Humidity: {historicalData[selectedDateIndex[0]].main.humidity}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5-Day Forecast */}
        {forecast.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">5-Day Forecast</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {forecast
                .filter((_, index) => index % 8 === 0)
                .slice(0, 5)
                .map((day, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm text-center hover:shadow-md transition-shadow p-4">
                    <div className="font-medium text-sm mb-2">
                      {new Date(day.dt * 1000).toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                    <img
                      src={getWeatherIcon(day.weather[0].icon) || "/placeholder.svg"}
                      alt={day.weather[0].description}
                      className="w-12 h-12 mx-auto mb-2"
                    />
                    <div className="text-lg font-semibold mb-1">{Math.round(day.main.temp)}°C</div>
                    <div className="text-xs text-gray-600 capitalize">{day.weather[0].description}</div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}