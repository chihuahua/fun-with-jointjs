function makeNode(graph, id, x, y) {
  // Create a rectangle with a label.
  var rect = new joint.shapes.basic.Rect({
    id: id,
    attrs: {
        rect: { fill: 'orange' },
        text: { text: 'n' + id }
    }
  }).addTo(graph);

  var textBlock = new joint.shapes.basic.TextBlock({
      position: {x: 0, y: 0},
      size: {width: 100, height: 30},
      attrs: {rect: {fill: '#C0D6FA'}},
      content: 'node ' + id
  }).addTo(graph);
  textBlock.attr({
    '*': {
      style:{'pointer-events':'none'}
    }
  });
  rect.embed(textBlock);

  var item0 = new joint.shapes.basic.Rect({
      id: id + 'inout0',
      position: {x: 0, y: 30},
      size: { width: 100, height: 30 },
      ports: {
        groups: {
            'inPorts': {
                attrs: {
                    text: { fill: '#000000' },
                    circle: { fill: '#00ff00', stroke: '#000000', magnet: true }
                },
                position: 'left',
                label: null,
            },
            'outPorts': {
                attrs: {
                    text: { fill: '#000000' },
                    circle: { fill: '#ff0000', stroke: '#000000', magnet: true }
                },
                position: 'right',
                label: null
            }
        },
        items: [
            {
                id: id + 'input0',
                group: 'inPorts',
                attrs: { text: { text: '' } }
            },
            {
                id: id + 'output0',
                group: 'outPorts',
                attrs: { text: { text: '' } }
            }
        ]
      }
  }).addTo(graph);
  item0.attr({
    'rect, text': {
      style: {
        'pointer-events': 'none'
      }
    },
    text: { text: id }
  });
  rect.embed(item0);

  rect.fitEmbeds();
  rect.translate(x, y);
  return rect;
}

function getDefaultLinkAttributes() {
  return {
    '.marker-target': {
          d: 'M 10 0 L 0 5 L 10 10 z'
    },
    router: { name: 'manhattan' }
  };
}

function makeLink(g, a, b) {
    var source = a.x ? a : { id: a.id + 'inout0', port: a.id + 'output0' };
    var target = b.x ? b : { id: b.id + 'inout0', port: b.id + 'input0' };
    var linkId = a.id + '-' + b.id;
    var linkObject = new joint.shapes.devs.Link({
        id: linkId,
        source: source,
        target: target,
        router: { name: 'metro' },
        connector: { name: 'rounded' }
    }).addTo(g);
    linkObject.attr(getDefaultLinkAttributes());
    return linkObject;
}

function validateConnection(
    cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
  // Prevent linking from input ports.
  if (magnetS && magnetS.getAttribute('port-group') === 'inPorts') {
    return false;
  }

  // Prevent linking from output ports to input ports within one element.
  if (cellViewS === cellViewT || magnetS === magnetT) {
    return false;
  }

  // Prevent linking to output ports.
  return magnetT && magnetT.getAttribute('port-group') === 'inPorts';
}

var graph = new joint.dia.Graph;

graph.on('change:source change:target', function(link) {
  var source = link.get('source');
  console.log(link, source);
  if (source.port && source.port.indexOf('input') != -1) {
    link.remove();
  }
})

var paper = new joint.dia.Paper({
    el: $('#graph-area'),
    width: 800,
    height: 600,
    model: graph,
    snapLinks: {
      radius: Infinity,
    },
    validateConnection: validateConnection,
    defaultLink: new joint.shapes.devs.Link({
        attrs: getDefaultLinkAttributes(),
        router: { name: 'metro' },
        connector: { name: 'rounded' },
    })
});

n0 = makeNode(graph, 'a', 100, 200);
n1 = makeNode(graph, 'b', 400, 200);
makeLink(graph, n0, n1);

joint.layout.DirectedGraph.layout(graph, { setLinkVertices: false });
