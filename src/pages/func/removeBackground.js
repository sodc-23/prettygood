export const removeBackground = async (base64Image) => {
  const formData = new FormData();
  formData.append('image_file_b64', base64Image.split(',')[1]);
  formData.append('size', 'auto');

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': 'orc8tpw68fNwizjioqiweapF',
    },
    body: formData,
  });

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  return url;
};
