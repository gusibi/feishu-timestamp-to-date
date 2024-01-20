import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { bitable, FieldType, INumberField, INumberFieldMeta, IDateTimeField, IDateTimeFieldMeta, DateFormatter } from '@lark-base-open/js-sdk';
import { Alert, AlertProps, Button, Checkbox, Select } from 'antd';
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
    const [selectMillisecond, setMillisecond] = useState<false>();
    const [selectDateFormat, setDateFormat] = useState<DateFormatter>();

    useEffect(() => {
        const fn = async () => {
            const table = await bitable.base.getActiveTable();
            const numberFieldMetaList = await table.getFieldMetaListByType<INumberFieldMeta>(FieldType.Number);
            setTsMetaList(numberFieldMetaList);
            const dateFieldMetaList = await table.getFieldMetaListByType<IDateTimeFieldMeta>(FieldType.DateTime);
            setDateMetaList(dateFieldMetaList);
        };
        fn();
    }, []);

    const onChange = (e) => {
        setMillisecond(e.target.checked);

    };

    const formatTsFieldMetaList = (metaList: INumberFieldMeta[]) => {
        return metaList.map(meta => ({ label: meta.name, value: meta.id }));
    };

    const formatDateFieldMetaList = (metaList: IDateTimeFieldMeta[]) => {
        return metaList.map(meta => ({ label: meta.name, value: meta.id }));
    };
    const defaultDateFormat = DateFormatter.DATE_TIME;


    const transform = async () => {
        var dateFormat = defaultDateFormat;
        if (selectDateFormat) {
            dateFormat = selectDateFormat;
        }
        if (!selectTsFieldId || !selectDateFieldId) {
            setInfo(`时间戳字段和目标日期字段都是必传字段!!!`);
            setAlertType('error');
            return;
        }
        const table = await bitable.base.getActiveTable();
        const tsField = await table.getField<INumberField>(selectTsFieldId);
        const dateField = await table.getField<IDateTimeField>(selectDateFieldId);

        const recordIdList = await table.getRecordIdList();
        for (const recordId of recordIdList) {
            var timestamp = await tsField.getValue(recordId);
            if (timestamp === null) {
                continue
            }
            if (!selectMillisecond) {
                timestamp = timestamp * 1000
            }
            await dateField.setValue(recordId, timestamp);
            await dateField.setDateFormat(dateFormat);
        }
        setInfo(`全部转换完成!!!`);
        setAlertType('success');
    }

    return <div>
        <Alert message={info} type={alertType} />
        <div>
            <div>
                <div className="input-label">选择时间戳字段</div>
                <Select className="select-field" onSelect={setSelectTsFieldId} options={formatTsFieldMetaList(timestampFieldMetaList)} />
                <Checkbox onChange={onChange} checked={selectMillisecond}  >
                    毫秒
                </Checkbox>
            </div>
            <div>
                <div className="input-label">选择目标时间字段</div>
                <Select className="select-field" onSelect={setSelectDateFieldId} options={formatDateFieldMetaList(dateFieldMetaList)} />
            </div>
            <div >
                <div className="input-label">选择时间格式</div>
                <Select className="select-field" options={DATEFORMAT} onSelect={setDateFormat} defaultValue={defaultDateFormat} />
            </div>
            <Button className="button" onClick={transform}>转换</Button>
        </div>
    </div>
}