import { Card, CardBody, CardHeader, CardTitle, Table } from 'reactstrap';

function TableContent({
    name,
    value,
    valueMin,
    valueMax,
    unit,
    data,
    dataEmpty,
}) {
    if (!data || !Array.isArray(data)) {
        return;
    }
    const formattedData = data.map((entry) => {
        const formattedEntry = {};
        for (const key in entry) {
            if (key.startsWith('min_')) {
                const field = key.substring(4);
                formattedEntry[field] = {
                    min: entry[key],
                    max: entry[`max_${field}`],
                    unit: entry[`unit_${field}`],
                };
            }
        }
        return formattedEntry;
    });
    return (
        <div className="wrapper">
            <Card>
                <CardHeader>
                    <CardTitle tag="h3">
                        <i className="tim-icons icon-bell-55 text-info" />{' '}
                        {name}
                    </CardTitle>
                </CardHeader>
                <CardBody>
                    {dataEmpty ? (
                        <div className="alert alert-warning" role="alert">
                            No data available for the selected criteria.
                        </div>
                    ) : (
                        <Table className="tablesorter" responsive>
                            <thead className="text-primary">
                                <tr>
                                    <th>{value}</th>
                                    <th>{valueMin}</th>
                                    <th>{valueMax}</th>
                                    <th className="text-center">{unit}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formattedData.map((item, index) =>
                                    Object.keys(item).map((key) => (
                                        <tr key={index}>
                                            <td>{key}</td>
                                            <td>{item[key].min}</td>
                                            <td>{item[key].max}</td>
                                            <td className="text-center">
                                                {item[key].unit}
                                            </td>
                                        </tr>
                                    )),
                                )}
                            </tbody>
                        </Table>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}

export default TableContent;
