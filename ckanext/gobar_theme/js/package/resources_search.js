/*
 * Buscador y orden de recursos en la página de un dataset.
 *
 * Filtra en el cliente los recursos listados en #pkg-resources (snippet
 * package/snippets/dataset_resource_item.html) a medida que se escribe en
 * #pkg-resources-search-input. Compara contra nombre, descripción y formato
 * (atributo data-search-text), sin distinguir mayúsculas ni acentos. Todas las
 * palabras escritas tienen que aparecer en el recurso para que se muestre.
 *
 * El combo #pkg-resources-sort-select reordena los mismos recursos por última
 * modificación (data-sort-date: last_modified o created) o por nombre
 * (data-sort-name). A igualdad de clave se respeta el orden original del dataset.
 */
$(function () {
    var $input = $('#pkg-resources-search-input');
    if (!$input.length) {
        return;
    }
    var $list = $('#pkg-resources');
    var $items = $list.find('.pkg-container');
    var $sort = $('#pkg-resources-sort-select');
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

    function compare(a, b) {
        return a < b ? -1 : (a > b ? 1 : 0);
    }

    $items.each(function (index) {
        var $item = $(this);
        $item.data('searchIndex', normalize($item.attr('data-search-text') || $item.text()));
        $item.data('sortName', normalize($item.attr('data-sort-name') || $item.find('h3').text()));
        // Fecha ISO (AAAA-MM-DDTHH:MM:SS): se compara como texto
        $item.data('sortDate', $item.attr('data-sort-date') || '');
        $item.data('sortOrder', index);
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

    function sort() {
        if (!$sort.length) {
            return;
        }
        var mode = $sort.val();
        var elements = $items.get();
        elements.sort(function (a, b) {
            var $a = $(a);
            var $b = $(b);
            var result;
            if (mode === 'name_asc') {
                result = compare($a.data('sortName'), $b.data('sortName'));
            } else if (mode === 'name_desc') {
                result = compare($b.data('sortName'), $a.data('sortName'));
            } else {
                // modified_desc: más reciente primero; sin fecha, al final
                result = compare($b.data('sortDate'), $a.data('sortDate'));
            }
            return result !== 0 ? result : $a.data('sortOrder') - $b.data('sortOrder');
        });
        $.each(elements, function (_, element) {
            $list.append(element);
        });
    }

    $input.on('input keyup search', filter);
    $sort.on('change', sort);

    sort();
    // Si el navegador restauró un texto al volver a la página, aplicarlo
    if ($input.val()) {
        filter();
    }
});
