package eu.europa.europarl.csio.elegislate.domain;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "view_rule_conditions_export")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class RuleExportDto {

    @Id
    @Column(name = "rule_id")
    private Long ruleId;

    @Column(name = "priority_order")
    private String priorityOrder;
    
    @Column(name = "part")
    private String part;

    @Column(name = "label")
    private String label;

    @Column(name = "condition_id")
    private Long conditionId;

    @Column(name = "textcondition")
    private String textCondition;

    @Column(name = "command_lang")
    private String commandLang;

    @Column(name = "command")
    private String command;

    @Column(name = "nestedConditionCommand_Id")
    private Long nestedConditionCommandId;

    @Column(name = "nestedConditionCommand_Language")
    private String nestedConditionCommandLanguage;

    @Column(name = "nestedConditionCommand_Command")
    private String nestedConditionCommandCommand;

    @Column(name = "comment")
    private String comment;
}
