import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { bitable, FieldType, INumberField, INumberFieldMeta, IDateTimeField, IDateTimeFieldMeta } from '@lark-base-open/js-sdk';
import { Alert, AlertProps, Button, Select } from 'antd';
import { TIMEZONE } from './const';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <LoadApp />
    </React.StrictMode>
)

function LoadApp() {
    const [info, setInfo] = useState('get table name, please waiting ....');
    const [alertType, setAlertType] = useState<AlertProps['type']>('info');
    const [timestampFieldMetaList, setTsMetaList] = useState<INumberFieldMeta[]>([])
    const [dateFieldMetaList, setDateMetaList] = useState<IDateTimeFieldMeta[]>([])
    const [selectTsFieldId, setSelectTsFieldId] = useState<string>();
    const [selectDateFieldId, setSelectDateFieldId] = useState<string>();
    const [selectTimezone, setTimezone] = useState<string>();

    useEffect(() => {
        const fn = async () => {
            const table = await bitable.base.getActiveTable();
            const tableName = await table.getName();
            setInfo(`The table Name is ${tableName}`);
            setAlertType('success');
            const numberFieldMetaList = await table.getFieldMetaListByType<INumberFieldMeta>(FieldType.Number);
            setTsMetaList(numberFieldMetaList);
            const dateFieldMetaList = await table.getFieldMetaListByType<IDateTimeFieldMeta>(FieldType.DateTime);
            setDateMetaList(dateFieldMetaList);
        };
        fn();
    }, []);

    const formatTsFieldMetaList = (metaList: INumberFieldMeta[]) => {
        return metaList.map(meta => ({ label: meta.name, value: meta.id }));
    };

    const formatDateFieldMetaList = (metaList: IDateTimeFieldMeta[]) => {
        return metaList.map(meta => ({ label: meta.name, value: meta.id }));
    };

    const transform = async () => {
        if (!selectTsFieldId || !selectDateFieldId || !selectTimezone) return;
        const table = await bitable.base.getActiveTable();
        const tsField = await table.getField<INumberField>(selectTsFieldId);
        const dateField = await table.getField<IDateTimeField>(selectDateFieldId);

        const recordIdList = await table.getRecordIdList();
        for (const recordId of recordIdList) {
            const timestamp = await tsField.getValue(recordId);
            await dateField.setValue(recordId, timestamp);
            await dateField.setDisplayTimeZone(true);
        }
    }

    return <div>
        <div style={{ margin: 10 }}>
            <div>选择时间戳字段</div>
            <Select style={{ width: 120 }} onSelect={setSelectTsFieldId} options={formatTsFieldMetaList(timestampFieldMetaList)} />
        </div>
        <div style={{ margin: 10 }}>
            <div>选择目标时间字段</div>
            <Select style={{ width: 120 }} onSelect={setSelectDateFieldId} options={formatDateFieldMetaList(dateFieldMetaList)} />
        </div>
        <div style={{ margin: 10 }}>
            <div>选择时区</div>
            <Select options={TIMEZONE} style={{ width: 120 }} onSelect={setTimezone} />
            <Button style={{ marginLeft: 10 }} onClick={transform}>transform</Button>
        </div>
    </div>
}