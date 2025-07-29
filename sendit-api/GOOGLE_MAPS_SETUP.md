# Google Maps API Setup Guide

This guide will help you set up Google Maps API for the Courier application to enable address autocomplete and geocoding features.

## Prerequisites

1. A Google Cloud Platform account
2. A billing account (Google Maps API requires billing to be enabled)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for your project

## Step 2: Enable Required APIs

Enable the following APIs in your Google Cloud Console:

1. **Places API** - For address autocomplete functionality
2. **Geocoding API** - For converting addresses to coordinates
3. **Maps JavaScript API** - For displaying maps

### To enable APIs:
1. Go to "APIs & Services" > "Library"
2. Search for each API and click "Enable"

## Step 3: Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key

## Step 4: Restrict API Key (Recommended)

For security, restrict your API key:

1. Click on the created API key
2. Under "Application restrictions", select "HTTP referrers (websites)"
3. Add your domain (e.g., `localhost:4200/*` for development)
4. Under "API restrictions", select "Restrict key"
5. Select the APIs you enabled (Places API, Geocoding API, Maps JavaScript API)

## Step 5: Update Application

Replace `YOUR_GOOGLE_MAPS_API_KEY` in the following files:

### 1. `src/index.html`
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=places"></script>
```

### 2. `src/app/shared/services/geocoding.service.ts`
```typescript
private readonly apiKey = 'YOUR_ACTUAL_API_KEY';
```

## Step 6: Test the Application

1. Start the development server: `ng serve`
2. Navigate to the admin dashboard
3. Try creating a parcel and test the address autocomplete
4. Check the customer dashboard to see the map with route visualization

## Features Enabled

With Google Maps API configured, you'll have access to:

### Address Autocomplete
- Real-time address suggestions as you type
- Restricted to Kenya addresses
- Validates addresses before submission

### Geocoding
- Converts addresses to coordinates for map display
- Handles address formatting and validation

### Interactive Maps
- Leaflet maps showing pickup and destination locations
- Route visualization with distance calculation
- Interactive markers with popup information

## Troubleshooting

### Common Issues:

1. **"Google Maps API error"**
   - Check if billing is enabled
   - Verify API key is correct
   - Ensure required APIs are enabled

2. **"Address autocomplete not working"**
   - Check if Places API is enabled
   - Verify API key restrictions allow your domain

3. **"Geocoding failed"**
   - Check if Geocoding API is enabled
   - Verify API key has proper permissions

### Development vs Production:

- **Development**: Use `localhost:4200/*` in API key restrictions
- **Production**: Add your production domain to API key restrictions

## Cost Considerations

Google Maps API has usage-based pricing:
- Places API: $17 per 1000 requests
- Geocoding API: $5 per 1000 requests
- Maps JavaScript API: $7 per 1000 map loads

For development and small applications, costs are typically minimal.

## Security Best Practices

1. Always restrict API keys to specific domains
2. Enable API restrictions to limit access to required APIs only
3. Monitor API usage in Google Cloud Console
4. Consider implementing rate limiting for production applications 