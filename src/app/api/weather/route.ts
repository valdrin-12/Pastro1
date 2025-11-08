import { NextResponse } from 'next/server';

// OpenWeatherMap API - Free tier
// Note: You'll need to get a free API key from https://openweathermap.org/api
// Add it to .env.local as: WEATHER_API_KEY=your_api_key_here
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '';
const DEFAULT_CITY = 'Pristina'; // Capital of Kosovo
const DEFAULT_COUNTRY_CODE = 'XK'; // Kosovo country code

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || DEFAULT_CITY;
    const countryCode = searchParams.get('country') || DEFAULT_COUNTRY_CODE;

    // If no API key is configured, return dynamic mock data
    if (!WEATHER_API_KEY || WEATHER_API_KEY === '') {
      console.warn('Weather API key not configured. Returning dynamic mock data.');
      
      // Generate dynamic mock data based on current date
      const today = new Date();
      const dayNames = ['DIE', 'HËN', 'MAR', 'MËR', 'ENJ', 'PRE', 'SHT'];
      const forecast = [];
      
      // Generate forecast for next 3 days with dynamic dates
      for (let i = 1; i <= 3; i++) {
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + i);
        forecast.push({
          day: dayNames[futureDate.getDay()],
          temp: { 
            max: Math.round(15 + Math.random() * 10 + i * 2), 
            min: Math.round(5 + Math.random() * 5 + i) 
          },
          icon: ['sun', 'cloud-sun', 'cloud'][Math.floor(Math.random() * 3)]
        });
      }
      
      return NextResponse.json({
        success: true,
        current: {
          temp: Math.round(10 + Math.random() * 8),
          description: 'Pjesshëm i vranët',
          icon: 'cloud-rain',
          city: city
        },
        forecast: forecast
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    // Fetch current weather
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city},${countryCode}&appid=${WEATHER_API_KEY}&units=metric&lang=sq`;
    const currentResponse = await fetch(currentWeatherUrl);
    
    if (!currentResponse.ok) {
      throw new Error(`Weather API error: ${currentResponse.status}`);
    }

    const currentData = await currentResponse.json();

    // Fetch 5-day forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city},${countryCode}&appid=${WEATHER_API_KEY}&units=metric&lang=sq`;
    const forecastResponse = await fetch(forecastUrl);

    if (!forecastResponse.ok) {
      throw new Error(`Forecast API error: ${forecastResponse.status}`);
    }

    const forecastData = await forecastResponse.json();

    // Map weather icon codes to Lucide icon names
    function getWeatherIcon(iconCode: string): string {
      const iconMap: { [key: string]: string } = {
        '01d': 'sun',      // clear sky day
        '01n': 'moon',    // clear sky night
        '02d': 'cloud-sun',   // few clouds day
        '02n': 'cloud-moon',  // few clouds night
        '03d': 'cloud',   // scattered clouds
        '03n': 'cloud',
        '04d': 'cloud',   // broken clouds
        '04n': 'cloud',
        '09d': 'cloud-rain',  // shower rain
        '09n': 'cloud-rain',
        '10d': 'cloud-rain',  // rain
        '10n': 'cloud-rain',
        '11d': 'cloud-lightning',  // thunderstorm
        '11n': 'cloud-lightning',
        '13d': 'snowflake',  // snow
        '13n': 'snowflake',
        '50d': 'cloud-fog',  // mist
        '50n': 'cloud-fog',
      };
      return iconMap[iconCode] || 'cloud';
    }

    // Get forecast for next 3 days (one entry per day)
    const forecastDays: any[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    const seenDates = new Set<string>();
    const dayNames = ['DIE', 'HËN', 'MAR', 'MËR', 'ENJ', 'PRE', 'SHT'];

    // Group forecast items by day and get max/min temperatures for each day
    const dailyForecasts: { [key: string]: { max: number; min: number; icon: string; date: Date } } = {};

    for (const item of forecastData.list) {
      const itemDate = new Date(item.dt * 1000);
      const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
      const dateKey = itemDateOnly.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Skip today
      if (itemDateOnly.getTime() === today.getTime()) {
        continue;
      }

      if (!dailyForecasts[dateKey]) {
        dailyForecasts[dateKey] = {
          max: item.main.temp_max,
          min: item.main.temp_min,
          icon: item.weather[0].icon,
          date: itemDateOnly
        };
      } else {
        // Update max/min for the day
        dailyForecasts[dateKey].max = Math.max(dailyForecasts[dateKey].max, item.main.temp_max);
        dailyForecasts[dateKey].min = Math.min(dailyForecasts[dateKey].min, item.main.temp_min);
        // Use the icon from the middle of the day (around noon)
        if (itemDate.getHours() >= 10 && itemDate.getHours() <= 14) {
          dailyForecasts[dateKey].icon = item.weather[0].icon;
        }
      }
    }

    // Convert to array and sort by date, take first 3
    const sortedDays = Object.values(dailyForecasts)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 3);

    for (const dayForecast of sortedDays) {
      forecastDays.push({
        day: dayNames[dayForecast.date.getDay()],
        temp: {
          max: Math.round(dayForecast.max),
          min: Math.round(dayForecast.min)
        },
        icon: getWeatherIcon(dayForecast.icon)
      });
    }

    // If we don't have 3 days, fill with estimated data
    while (forecastDays.length < 3) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + forecastDays.length + 1);
      forecastDays.push({
        day: dayNames[futureDate.getDay()],
        temp: {
          max: Math.round(currentData.main.temp + (forecastDays.length * 2)),
          min: Math.round(currentData.main.temp - (forecastDays.length * 2))
        },
        icon: getWeatherIcon(currentData.weather[0].icon)
      });
    }

    const response = NextResponse.json({
      success: true,
      current: {
        temp: Math.round(currentData.main.temp),
        description: currentData.weather[0].description || 'I qartë',
        icon: getWeatherIcon(currentData.weather[0].icon),
        city: currentData.name || city
      },
      forecast: forecastDays
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });

    return response;
  } catch (error) {
    console.error('Error fetching weather:', error);
    
    // Return dynamic mock data on error
    const today = new Date();
    const dayNames = ['DIE', 'HËN', 'MAR', 'MËR', 'ENJ', 'PRE', 'SHT'];
    const forecast = [];
    
    // Generate forecast for next 3 days with dynamic dates
    for (let i = 1; i <= 3; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
      forecast.push({
        day: dayNames[futureDate.getDay()],
        temp: { 
          max: Math.round(15 + Math.random() * 10 + i * 2), 
          min: Math.round(5 + Math.random() * 5 + i) 
        },
        icon: ['sun', 'cloud-sun', 'cloud'][Math.floor(Math.random() * 3)]
      });
    }
    
    return NextResponse.json({
      success: true,
      current: {
        temp: Math.round(10 + Math.random() * 8),
        description: 'Pjesshëm i vranët',
        icon: 'cloud-rain',
        city: DEFAULT_CITY
      },
      forecast: forecast
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }
}

