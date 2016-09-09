var cssplexity = require('cssplexity');
var argv = require('yargs').argv;

function convertTypeToPseudoCondition (node) {
  var property = node.name || node.operator;
  var condition = (node.type).replace(/[^\w]+/gi, '_');
  if (node.type === 'operator') {
    if (node.operator === '>') {
      condition = 'adjacent_sibling';
      property = false;
    } else if (node.operator === '~') {
      condition = 'general_sibling';
      property = false;
    }
  } else if (node.type === 'element') {
    condition = 'on';
  }
  return 'is_' + condition + (property ? ' »' + property + '«' : '');
}

if (argv._ && argv._.length) {

  var tree = cssplexity.tree(argv._[0]);

  var dot = [
    'digraph CSSplexity',
    '{'
  ];

  tree.forEach(function (node, index) {
    if (index > 0) {
      dot.push('node_' + index + ' [shape=box,label="IF (' + convertTypeToPseudoCondition(node) + ')"];');
    } else {
      dot.push('node_' + index + ' [shape=box,label="Enter"];');
    }
  });

  dot.push('exit [label="Exit"];');

  tree.forEach(function (node, index) {
    if (index > 0) {
      var target;
      if ((index + 1) < tree.length) {
        target = 'node_' + (index + 1);
      } else {
        target = 'exit';
      }
      dot.push('node_' + index + ' -> ' + target + ' [label="true"];');
      dot.push('node_' + index + ' -> exit [style=dotted,label="false"];');
    } else {
      dot.push('node_' + index + ' -> node_' + (index + 1) + ';');
    }
  });

  dot.push('}');

  console.log(dot.join('\n'));

} else {
  console.error('Missing selector.');
  process.exit(1);
}
