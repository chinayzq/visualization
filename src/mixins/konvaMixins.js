import Konva from 'konva';
export const konvaMixins = {
  methods: {
    initKonvaStage(container, width, height) {
      return new Konva.Stage({
        container,
        width,
        height,
      });
    },
    initLayer() {
      return new Konva.Layer();
    },
    addLayerToStage(stage, layer) {
      stage.add(layer);
    },
    Transformer(node) {
      return new Konva.Transformer({
        node,
      });
    },
    /**
     * 生成一个用不重复的ID
     */
    GenNonDuplicateID() {
      return Date.now().toString(36);
    },
  },
};
