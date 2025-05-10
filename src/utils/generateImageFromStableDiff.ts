import axios from 'axios'

// 1 credit is 0.01
// Ultra uses 8 credits ($0.08)
// core uses 3 credits ($0.03)
// sd3 uses 3.5

export async function generateImageFromStableDiffusion(prompt: string, artStyle: string, complexity: number): Promise<ArrayBuffer> {
  // Craft a detailed prompt that incorporates all parameters
  const detailLevel = complexity <= 3 ? 'minimal' : complexity <= 6 ? 'moderate' : 'intricate';
  const colorStyle = complexity <= 4 ? 'limited color palette' : 'vibrant colors';
  
  const mainPrompt = `
    a 30x30 pixel art dotmint of ${prompt} 
    in ${artStyle} style, 
    with ${detailLevel} details and ${colorStyle}, 
    pixelated texture, 
    flat colors with no anti-aliasing, 
    perfect for a retro game sprite, 
    square pixels, 
    pixel art complexity level: ${complexity}/10
  `.trim().replace(/\s+/g, ' ');
  
  // Create form data for the API request
  const formData = new FormData();
  formData.append('prompt', mainPrompt);
  formData.append('output_format', 'jpeg');
  formData.append('aspect_ratio', '1:1');

  // Add negative prompt to avoid unwanted details
  const negativePrompt = "blurry, smooth, realistic, high resolution, detailed, 3D, shading, anti-aliasing, gradients";
  formData.append('negative_prompt', negativePrompt);
  
  // Use different model based on complexity
  const endpoint = complexity >= 8 
    ? 'ultra' 
    : 'core';

  // Make the API request
  const response = await axios.post(
    `https://api.stability.ai/v2beta/stable-image/generate/${endpoint}`,
    formData,
    {
      headers: {
        Authorization: import.meta.env.VITE_SD_API_KEY,
        Accept: 'image/*',
      },
      responseType: 'arraybuffer',
    },
  );

  if (response.status !== 200) {
    throw new Error(`Error: ${response.status}, ${response.statusText}`);
  }

  return response.data;
}