import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { bitable, FieldType, INumberField, INumberFieldMeta, IDateTimeField, IDateTimeFieldMeta, DateFormatter } from '@lark-base-open/js-sdk';
import { Alert, AlertProps, Button, Select } from 'antd';
import { TIMEZONE, DATEFORMAT } from './const';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <LoadApp />
    </React.StrictMode>
)



function LoadApp() {
    const [info, setInfo] = useState('请选择您要转换的字段');
    const [alertType, setAlertType] = useState<AlertProps['type']>('info');
    const [timestampFieldMetaList, setTsMetaList] = useState<INumberFieldMeta[]>([])
    const [dateFieldMetaList, setDateMetaList] = useState<IDateTimeFieldMeta[]>([])
    const [selectTsFieldId, setSelectTsFieldId] = useState<string>();
    const [selectDateFieldId, setSelectDateFieldId] = useState<string>();
    const [selectTimezone, setTimezone] = useState<string>();
    const [selectDateFormat, setDateFormat] = useState<DateFormatter>();

    useEffect(() => {
        const fn = async () => {
            const table = await bitable.base.getActiveTable();
            // const tableName = await table.getName();
            // setInfo(`The table Name is ${tableName}`);
            // setAlertType('success');
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
        if (!selectDateFormat) {
            setDateFormat(DateFormatter.DATE_TIME);
        }
        if (!selectTsFieldId || !selectDateFieldId || !selectDateFormat) {
            setInfo(`时间戳字段和目标日期字段都是必传字段!!!`);
            setAlertType('error');
            return;
        }
        const table = await bitable.base.getActiveTable();
        const tsField = await table.getField<INumberField>(selectTsFieldId);
        const dateField = await table.getField<IDateTimeField>(selectDateFieldId);

        const recordIdList = await table.getRecordIdList();
        for (const recordId of recordIdList) {
            const timestamp = await tsField.getValue(recordId);
            if (timestamp == 0) {
                continue
            }
            await dateField.setValue(recordId, timestamp);
            await dateField.setDisplayTimeZone(true);
            await dateField.setDateFormat(selectDateFormat);
        }
        setInfo(`全部转换完成!!!`);
        setAlertType('success');
    }

    return <div>
        <Alert message={info} type={alertType} />
        <div style={{ margin: 10 }}>
            <div>选择时间戳字段</div>
            <Select style={{ width: 120 }} onSelect={setSelectTsFieldId} options={formatTsFieldMetaList(timestampFieldMetaList)} />
        </div>
        <div style={{ margin: 10 }}>
            <div>选择目标时间字段</div>
            <Select style={{ width: 120 }} onSelect={setSelectDateFieldId} options={formatDateFieldMetaList(dateFieldMetaList)} />
        </div>
        {/* <div style={{ margin: 10 }}>
            <div>选择时区</div>
            <Select options={TIMEZONE} style={{ width: 120 }} onSelect={setTimezone} />
        </div> */}
        <div style={{ margin: 10 }}>
            <div>选择时间格式</div>
            <Select options={DATEFORMAT} style={{ width: 120 }} onSelect={setDateFormat} />
        </div>
        <Button style={{ marginLeft: 10 }} onClick={transform}>转换</Button>
    </div>
}