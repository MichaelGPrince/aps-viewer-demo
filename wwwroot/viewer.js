/// import * as Autodesk from "@types/forge-viewer";

async function getAccessToken(callback) {
    try {
        const resp = await fetch('/api/auth/token');
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        const { access_token, expires_in } = await resp.json();
        callback(access_token, expires_in);
    } catch (err) {
        alert('Could not obtain access token. See the console for more details.');
        console.error(err);
    }
}

export function initViewer(container) {
    return new Promise(function (resolve, reject) {
        Autodesk.Viewing.Initializer({ getAccessToken }, function () {
            const config = {
                extensions: ['Autodesk.DocumentBrowser']
            };
            const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);
            viewer.start();
            viewer.setTheme('light-theme');
            console.log("viewer object:", viewer);
            resolve(viewer);
        });
    });
}

export function loadModel(viewer, urn) {
    return new Promise(function (resolve, reject) {
        function onDocumentLoadSuccess(doc) {
            // populate3DViewSelection(doc);
            populate2DViewSelection(doc);
            resolve(viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry()));
            const print = doc.getRoot();
            console.log("* Root node:", print);
        }
        function onDocumentLoadFailure(code, message, errors) {
            reject({ code, message, errors });
        }
        viewer.setLightPreset(0);
        Autodesk.Viewing.Document.load('urn:' + urn, onDocumentLoadSuccess, onDocumentLoadFailure);
    });
}

export function loadView(viewer, urn, viewGuid) {
    return new Promise(function (resolve, reject) {
        function onDocumentLoadSuccess(doc) {
            // populate3DViewSelection(doc, viewGuid);
            populate2DViewSelection(doc, viewGuid);
            resolve(viewer.loadDocumentNode(doc, doc.getRoot().findByGuid(viewGuid).getDefaultGeometry()));
        }
        function onDocumentLoadFailure(code, message, errors) {
            reject({ code, message, errors });
        }
        viewer.setLightPreset(0);
        Autodesk.Viewing.Document.load('urn:' + urn, onDocumentLoadSuccess, onDocumentLoadFailure);
    });
}

function populate2DViewSelection(doc, selectedGuid) {
    const dropdown = document.getElementById('2Dviews');
    dropdown.innerHTML = '';
    const viewOptions = doc.getRoot().search({"role":"2d", "type":"geometry"});
    console.log("2D viewOptions:", viewOptions);
    selectedGuid = selectedGuid || "abc";
    dropdown.innerHTML = viewOptions.map(view => `<option value=${view.data.guid} ${view.data.guid === selectedGuid ? 'selected' : ''}>${view.data.name}</option>`).join('\n');
}

function populate3DViewSelection(doc, selectedGuid) {
    const dropdown = document.getElementById('3Dviews');
    dropdown.innerHTML = '';
    const viewOptions = doc.getRoot().getNamedViews();
    console.log("3D viewOptions", viewOptions);
    selectedGuid = selectedGuid || "abc";
    dropdown.innerHTML = viewOptions.map(view => `<option value=${view.parent.data.guid} ${view.parent.data.guid === selectedGuid ? 'selected' : ''}>${view.data.name}</option>`).join('\n');
}
