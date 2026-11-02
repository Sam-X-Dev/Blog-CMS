import { Node } from "@tiptap/react";
import type { DOMOutputSpec } from "@tiptap/pm/model";

/**
 * A picture with an optional caption underneath:
 *   <figure><img src alt><figcaption>Caption</figcaption></figure>
 * Every picture added from the ribbon, the media library or drag-and-drop is a figure.
 * Old plain <img> pictures still work; "Caption" turns them into a figure.
 */
export const Figure = Node.create({
  name: "figure",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      caption: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure",
        getAttrs: (el) => {
          const img = el.querySelector("img");
          const src = img?.getAttribute("src");
          if (!src) return false;
          return {
            src,
            alt: img?.getAttribute("alt") || null,
            caption: el.querySelector("figcaption")?.textContent?.trim() ?? "",
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const img: DOMOutputSpec = ["img", { src: node.attrs.src, alt: node.attrs.alt ?? "" }];
    const caption = String(node.attrs.caption ?? "").trim();
    return caption ? ["figure", {}, img, ["figcaption", {}, caption]] : ["figure", {}, img];
  },
});
