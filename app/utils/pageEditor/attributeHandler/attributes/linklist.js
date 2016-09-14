import $ from 'jquery'

export default {
  link: {
    set($dom, value) {
      $dom.text(value.text);
      $dom.attr('wp-a-href', value.href);
      $dom.attr('target', value.target);
      $dom.attr('wp-a-self-page', value.linkself ? "" : undefined);
    },
    get($dom) {
      return {
        text: $dom.text(),
        href: $dom.attr('wp-a-href') || '',
        target: $dom.attr('target') || '',
        linkself: $dom.attr('wp-a-self-page') == ""
      }
    }
  },
  linkInline: {
    set($dom, value) {
      if (value) {
        $dom.addClass('a-block');
      } else {
        $dom.removeClass('a-block');
      }
    },
    get($dom) {
      return $dom.hasClass('a-block');
    }
  },
  linkListData: {
    set($dom, value) {
      $dom.empty();
      for (var i = 0; i < value.length; i++) {
        var link = value[i];
        $dom.append(`<a href="#" wp-a-href="${link.href}" ${link.linkself ? 'wp-a-self-page' : ''} target="${link.target}" wp-no-select>${link.text}</a>`);
      }
    },
    get($dom) {
      let ret = [];
      $('a', $dom).each((index, dom) => {
        ret.push({
          text: $(dom).text(),
          href: $(dom).attr('wp-a-href') || '',
          target: $(dom).attr('target') || '',
          linkself: $(dom).attr('wp-a-self-page') == ""
        })
      });
      return ret;
    }
  }
}