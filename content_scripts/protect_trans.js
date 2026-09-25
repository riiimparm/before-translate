// Ensure <samp> elements are not translated unless already inside a span[translate="no"]
(function() {
  function processSamp(samp) {
    if (!(samp instanceof Element)) return;
    // If it's already inside a span[translate="no"], do nothing
    if (samp.closest('span[translate="no"]')) return;
    // If the element itself already has translate="no", do nothing
    if (samp.getAttribute && samp.getAttribute('translate') === 'no') return;
    samp.setAttribute('translate', 'no');
  }

  // Protect <li> elements that contain only <a> children (and whitespace)
  function processListItem(li) {
    if (!(li instanceof Element)) return;
    if (li.closest && li.closest('span[translate="no"]')) return;
    if (li.getAttribute && li.getAttribute('translate') === 'no') return;

    let onlyAnchors = true;
    for (const child of li.childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (child.tagName.toLowerCase() !== 'a') { onlyAnchors = false; break; }
      } else if (child.nodeType === Node.TEXT_NODE) {
        if ((child.textContent || '').trim() !== '') { onlyAnchors = false; break; }
      } else if (child.nodeType === Node.COMMENT_NODE) {
        // comments don't affect the check
        continue;
      } else {
        onlyAnchors = false; break;
      }
    }

    if (onlyAnchors) {
      li.setAttribute('translate', 'no');
      return;
    }

    // Protect <li> whose entire content is a single word with no child elements
    if (li.children.length === 0) {
      const text = (li.textContent || '').trim();
      if (text !== '' && !/\s/.test(text)) {
        li.setAttribute('translate', 'no');
      }
    }
  }

  function scanAll() {
    document.querySelectorAll('samp').forEach(processSamp);
    document.querySelectorAll('li').forEach(processListItem);
  }

  // Run once on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanAll);
  } else {
    scanAll();
  }

  // Also watch for dynamically added <samp> elements
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        const el = /** @type {Element} */ (node);
        const tag = el.tagName && el.tagName.toLowerCase();
        if (tag === 'samp') {
          processSamp(el);
        } else if (tag === 'li') {
          processListItem(el);
        } else {
          el.querySelectorAll && el.querySelectorAll('samp').forEach(processSamp);
          el.querySelectorAll && el.querySelectorAll('li').forEach(processListItem);
        }
      }
    }
  });

  // Start observing the document
  try {
    observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
  } catch (e) {
    // If observe fails (very early), try again on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
    });
  }

})();
