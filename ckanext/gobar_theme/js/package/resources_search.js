/*
 * Buscador de recursos en la página de un dataset.
 *
 * Filtra en el cliente los recursos listados en #pkg-resources (snippet
 * package/snippets/dataset_resource_item.html) a medida que se escribe en
 * #pkg-resources-search-input. Compara contra nombre, descripción y formato
 * (atributo data-search-text), sin distinguir mayúsculas ni acentos. Todas las
 * palabras escritas tienen que aparecer en el recurso para que se muestre.
 */
$(function () {
    var $input = $('#pkg-resources-search-input');
    if (!$input.length) {
        return;
    }
    var $items = $('#pkg-resources .pkg-container');
    var $count = $('#pkg-resources-search .pkg-resources-search-count');
    var $empty = $('#pkg-resources-search .pkg-resources-search-empty');
    var total = $items.length;

    function normalize(text) {
        text = (text || '').toLowerCase();
        if (text.normalize) {
            // Saca los acentos: "población" -> "poblacion"
            text = text.normalize('NFD').replace(/[̀-ͯ]/g, '');
        }
        return text;
    }

    $items.each(function () {
        var $item = $(this);
        $item.data('searchIndex', normalize($item.attr('data-search-text') || $item.text()));
    });

    function filter() {
        var words = normalize($input.val()).split(/\s+/).filter(Boolean);
        var visible = 0;
        $items.each(function () {
            var $item = $(this);
            var index = $item.data('searchIndex');
            var match = true;
            for (var i = 0; i < words.length; i++) {
                if (index.indexOf(words[i]) === -1) {
                    match = false;
                    break;
                }
            }
            $item.toggle(match);
            if (match) {
                visible++;
            }
        });
        if (words.length) {
            $count.text('Mostrando ' + visible + ' de ' + total + ' recursos');
        } else {
            $count.text('');
        }
        $empty.toggleClass('hidden', visible > 0);
    }

    $input.on('input keyup search', filter);
    // Si el navegador restauró un texto al volver a la página, aplicarlo
    if ($input.val()) {
        filter();
    }
});
