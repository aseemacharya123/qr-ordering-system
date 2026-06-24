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