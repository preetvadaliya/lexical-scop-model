/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/**
 * @author preetvadaliya@gmail.com (Preet Vadaliya)
 */

import * as Blockly from 'blockly';
import {createPlayground} from '@blockly/dev-tools';
import '../src/index';
import {FieldLexicalDropdown, FieldLexicalVariable} from '../src/index';

Blockly.Blocks['global_variable'] = {
  init: function() {
    this.appendValueInput('INPUT0')
        .setCheck(null)
        .appendField('initialize global variable')
        .appendField(new FieldLexicalVariable('name', 'global', 'variable'), 'VAR_NAME')
        .appendField('to');
    this.setColour(330);
    this.setTooltip('');
    this.setHelpUrl('');
  },
};

Blockly.Blocks['global_const'] = {
  init: function() {
    this.appendValueInput('INPUT0')
        .setCheck(null)
        .appendField('initialize global const')
        .appendField(new FieldLexicalVariable('name', 'global', 'const'), 'CONST_NAME')
        .appendField('to');
    this.setColour(330);
    this.setTooltip('');
    this.setHelpUrl('');
  },
};

Blockly.Blocks['global_variable_get'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('get')
        .appendField(new FieldLexicalDropdown(), 'OP');
    this.setOutput(true, null);
    this.setColour(120);
    this.setTooltip('');
    this.setHelpUrl('');
  },
};

Blockly.Blocks['global_variable_set'] = {
  init: function() {
    this.appendValueInput('INPUT0')
        .appendField('set')
        .appendField(new FieldLexicalDropdown(), 'OP')
        .appendField('to');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('');
    this.setHelpUrl('');
  },
};

Blockly.Blocks['control_for_loop'] = {
  init: function() {
    this.appendValueInput('INPUT0')
        .setCheck(null)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('for each')
        .appendField(new FieldLexicalVariable('name', 'local', 'variable'), 'VAR_NAME')
        .appendField('from');
    this.appendValueInput('INPUT1')
        .setCheck(null)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('to');
    this.appendValueInput('INPUT2')
        .setCheck(null)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('by');
    this.appendStatementInput('DO')
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('');
    this.setHelpUrl('');
  },
};

Blockly.JavaScript['global_variable'] = function(block) {
  // eslint-disable-next-line max-len
  const input = Blockly.JavaScript.valueToCode(block, 'INPUT0', Blockly.JavaScript.ORDER_ATOMIC);
  const varName = block.getFieldValue('VAR_NAME');
  const code = `let ${varName} = ${input};\n`;
  return code;
};

Blockly.JavaScript['global_const'] = function(block) {
  const input = Blockly.JavaScript.valueToCode(block, 'INPUT0', Blockly.JavaScript.ORDER_ATOMIC);
  const constName = block.getFieldValue('CONST_NAME');
  const code = `const ${constName} = ${input};\n`;
  return code;
};

Blockly.JavaScript['global_variable_get'] = function(block) {
  const code = ``;
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['global_variable_set'] = function(block) {
  const input = Blockly.JavaScript.valueToCode(block, 'INPUT0', Blockly.JavaScript.ORDER_ATOMIC);
  const code = ``;
  return code;
};

Blockly.JavaScript['control_for_loop'] = function(block) {
  const input0 = Blockly.JavaScript.valueToCode(block, 'INPUT0', Blockly.JavaScript.ORDER_ATOMIC);
  const input1 = Blockly.JavaScript.valueToCode(block, 'INPUT1', Blockly.JavaScript.ORDER_ATOMIC);
  const input2 = Blockly.JavaScript.valueToCode(block, 'INPUT2', Blockly.JavaScript.ORDER_ATOMIC);
  const input3 = Blockly.JavaScript.statementToCode(block, 'DO');
  const code = '...;\n';
  return code;
};

const toolbox = document.getElementById('toolbox');

/**
 * Create a workspace.
 * @param {HTMLElement} blocklyDiv The blockly container div.
 * @param {!Blockly.BlocklyOptions} options The Blockly options.
 * @return {!Blockly.WorkspaceSvg} The created workspace.
 */
function createWorkspace(blocklyDiv, options) {
  const workspace = Blockly.inject(blocklyDiv, options);
  window.workspace = workspace;
  return workspace;
}

document.addEventListener('DOMContentLoaded', function() {
  const defaultOptions = {
    toolbox,
  };
  createPlayground(document.getElementById('root'),
      createWorkspace, defaultOptions);
});
