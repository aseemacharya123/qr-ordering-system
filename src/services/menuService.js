export async function fetchMenu(apiUrl) {

  try {

    const finalUrl =
      apiUrl.includes('?')
        ? `${apiUrl}&action=menu`
        : `${apiUrl}?action=menu`;

    console.log(
      'FETCH URL:',
      finalUrl
    );

    const response =
      await fetch(finalUrl);

    const data =
      await response.json();

    console.log(
      'FETCHED MENU DATA:',
      data
    );

    return {
      categories:
        data.categories || [],
      items:
        data.items || [],
    };

  } catch (error) {

    console.error(
      'Fetch Menu Error:',
      error
    );

    return {
      categories: [],
      items: [],
    };
  }
}

// Public, no-login endpoint — a business's UPI ID is the same information already printed
// on its physical counter/soundbox QR code, so there's nothing sensitive about exposing it
// to any customer loading the menu.
export async function fetchBusinessSettings(apiUrl) {

  try {

    const finalUrl =
      apiUrl.includes('?')
        ? `${apiUrl}&action=settings`
        : `${apiUrl}?action=settings`;

    const response =
      await fetch(finalUrl);

    const data =
      await response.json();

    return {
      upiId: data.upiId || '',
      upiPayeeName: data.upiPayeeName || '',
    };

  } catch (error) {

    console.error(
      'Fetch Settings Error:',
      error
    );

    return {
      upiId: '',
      upiPayeeName: '',
    };
  }
}