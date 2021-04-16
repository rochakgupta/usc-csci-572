const App = (() => {
    'use strict';

    let searchQuery = null;
    let searchType = null;
    let searchResults = null;

    const showResults = (data) => {
        const { start, end, total, documents } = data;
        let innerHTML = `<div>Results ${start} - ${end} of ${total}:</div>`
        documents.forEach((document) => {
            const { title, url, id, description } = document;
            innerHTML += `
                <div>
                    <div>Title: <a target='_blank' href=${url}>${title}<a/></div>
                    <div>URL: <a target='_blank' href=${url}>${url}<a/></div>
                    <div>ID: ${id}</div>
                    <div>Description: ${description}</div>
                </div>
            `
        })
        searchResults.innerHTML = innerHTML;
    }

    const showMessage = (message) => {
        searchResults.innerHTML = `<div>${message}<div>`;
    }

    const fetcher = (path, params = {}) => {
        class CheckedError extends Error {
            constructor(message) {
                super(message);
            }
        }

        let url = path;
        if (Object.keys(params).length > 0) {
            const queryString = (new URLSearchParams(params)).toString();
            url += `?${queryString}`;
        }

        return fetch(url)
            .then((response) => response.json()
                .then((data) => {
                    if (response.status === 200) {
                        return data;
                    } else if (data.message) {
                        throw new CheckedError(data.message);
                    } else {
                        throw new CheckedError('Internal server error');
                    }
                })
            ).catch((error) => {
                if (!(error instanceof CheckedError)) {
                    error = new CheckedError('Network error');
                }
                throw error;
            })
    }

    const search = async () => {
        try {
            const data = await fetcher('/search', {
                query: searchQuery,
                type: searchType
            });
            showResults(data);
        } catch (error) {
            showMessage(error.message);
        }
    }

    const searchInputChangeHandler = (event) => {
        searchQuery = event.target.value;
    }

    const searchButtonClickHandler = async (event) => {
        if (searchQuery && searchQuery.length > 0 && searchType) {
            event.preventDefault();
            await search();
        } else {
            showMessage('Please enter query and select a query type');
        }
    }

    const searchTypeInputClickHandler = (event) => {
        searchType = event.target.value;
    }

    const init = () => {
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('change', searchInputChangeHandler);

        const searchTypeInputs = document.querySelectorAll('.search-type');
        searchTypeInputs.forEach((searchTypeInput) => {
            searchTypeInput.addEventListener('click', searchTypeInputClickHandler);
        })

        const searchButton = document.getElementById('search-button');
        searchButton.addEventListener('click', searchButtonClickHandler);

        searchResults = document.getElementById('search-results');
    }


    return {
        init
    };
})();